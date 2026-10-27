/**
 * Real Claude CLI end-to-end smoke (optional; needs an authenticated `claude`).
 *
 * Boots an isolated headless profile with this package installed, enables the
 * Claude CLI backend in the row config, and drives the managed CLI child through
 * the real host tools:
 *
 *   create → wait_subagent → send_message continue → wait_subagent →
 *   send_message again → interrupt_agent → wait_subagent
 *
 * This starts the real `claude` binary (plan permission mode, no tools) three
 * times and therefore consumes a little Claude quota. It never touches the
 * repository and keeps the DSH profile in a temp directory; the CLI's own
 * native session/credential home stays the user's, because changing
 * CLAUDE_CONFIG_DIR would change Claude's keychain lookup and lose auth.
 *
 * Run:
 *   DSH_PACKAGE_ROOT="/…/node_modules/@deepseek-ai/dsh" node scripts/cli-smoke.mjs [claude|codex]
 */

import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile, cp, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dsh = process.env.DSH_PACKAGE_ROOT
if (!dsh) throw new Error('Set DSH_PACKAGE_ROOT to the installed @deepseek-ai/dsh package')
const cli = process.argv[2] ?? 'claude'
assert.ok(['claude', 'codex'].includes(cli), 'cli must be claude or codex')
const packageName = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).name
const home = await mkdtemp(join(tmpdir(), `dsh-better-subagent-cli-smoke-${cli}-`))
process.env.DSH_HOME = home
process.env.DSH_TELEMETRY_DISABLED = '1'

const A = await import(pathToFileURL(join(dirname(dsh), 'dsh-app-boot/lib/index.js')))
const dir = A.resolveProfileDir('it', home)
A.initProfile(dir, [...A.PROFILE_TEMPLATES.headless.bundles, packageName])
const packageFile = join(dir, 'package.json')
const manifest = JSON.parse(await readFile(packageFile, 'utf8'))
const modules = join(dir, 'node_modules')
await mkdir(join(modules, '@menghuan1918'), { recursive: true })
const plugin = join(modules, '@menghuan1918', 'dsh-better-subagent')
await mkdir(plugin, { recursive: true })
for (const name of ['package.json', 'src', 'docs', 'cordis.patch.yml', 'LICENSE', 'README.md', 'third-party']) {
  await cp(join(root, name), join(plugin, name), { recursive: true })
}
await symlink(dirname(dsh), join(modules, '@deepseek-ai'))
manifest.dependencies[packageName] = `file:${plugin}`
await writeFile(packageFile, JSON.stringify(manifest, null, 2))

const model = cli === 'codex' ? (process.env.CODEX_SMOKE_MODEL ?? 'gpt-5-codex') : (process.env.CLAUDE_SMOKE_MODEL ?? 'sonnet')
const backend = cli === 'claude'
  ? { enabled: true, executable: 'claude', permissionMode: 'plan', defaultModel: model, models: [{ id: model, efforts: ['low', 'medium', 'high'], defaultEffort: 'low' }] }
  : { enabled: true, executable: 'codex', permissionMode: 'read-only', defaultModel: model, models: [{ id: model, efforts: ['low', 'medium', 'high'], defaultEffort: 'low' }] }
await writeFile(join(dir, 'cordis.patch.yml'), JSON.stringify([
  { id: 'headless-startup', disabled: true },
  { id: 'headless-runner', disabled: true },
  { id: 'credentials', disabled: false, config: { watch: false } },
  { id: 'dsh-better-subagent', config: { subagents: { global: true, [cli]: backend } } },
]))

const { runProfile } = await import(pathToFileURL(join(dsh, 'lib/profile-boot.js')))
const work = join(home, 'work')
await mkdir(work, { recursive: true })
let ctx
try {
  const booted = await runProfile({ profile: 'it', patchFiles: [], args: [], environment: A.loadLayeredEnv('dsh') })
  ctx = booted.ctx

  const adapter = {
    providerInfo: (id) => ({ id, name: 'Better Subagent CLI smoke parent adapter' }),
    providerRetryPolicy: () => undefined,
    imageRequestPricing: () => undefined,
    listModels: async () => [{ provider: 'it-noop', id: 'noop', name: 'Noop', inputModalities: ['text'] }],
    resolveModel: async (provider, id) => ({ provider, id, name: id, inputModalities: ['text'] }),
    async prepareCall(provider, id) { return { model: await adapter.resolveModel(provider, id), stream: () => adapter.stream() } },
    async *stream() {
      yield { type: 'block-start', index: 0, blockType: 'text' }
      yield { type: 'text-delta', index: 0, text: 'Parent smoke response.' }
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Parent smoke response.' } }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  ctx.llm.registerAdapter(['it-noop'], adapter)

  const created = await ctx.agents.create({
    sessionId: randomUUID(),
    meta: { cwd: work },
    agentOptions: { provider: 'it-noop', model: 'noop' },
    setup: async () => {},
  })
  const agent = created.agent
  const call = async (name, args) => {
    assert.ok(ctx.tools.get(name, agent), `${name} must be visible`)
    const result = await ctx.tools.execute({ name, arguments: args, agent, signal: new AbortController().signal, callId: randomUUID() })
    assert.equal(result.isError, false, `${name} failed: ${JSON.stringify(result.error ?? result.content)}`)
    return result.value
  }

  // The synthetic CLI route must be registered with an allowlisted model.
  const route = cli === 'codex' ? 'apollo-cli-codex' : 'apollo-cli-claude'
  assert.ok(ctx.llm.listProviders().some((provider) => provider.id === route), `${route} is registered`)
  const listed = await ctx.llm.listModels(route)
  assert.ok(listed.some((entry) => entry.id === model), `${route} lists ${model}`)

  // 1) create a real CLI child, wait for turn one.
  const first = await call('subagent', {
    provider: cli,
    description: `${cli} smoke child`,
    prompt: 'Reply with exactly the text: SMOKE ONE',
  })
  const childId = first.subagentId
  const firstWait = await call('wait_subagent', { subagent_id: [childId] })
  assert.match(firstWait, new RegExp(`subagent ${childId} done \\(completed\\)`))

  // 2) continue the same durable child (native session resume), wait for turn two.
  await call('send_message', { agent_id: childId, message: 'Reply with exactly the text: SMOKE TWO' })
  const secondWait = await call('wait_subagent', { subagent_id: [childId] })
  assert.match(secondWait, new RegExp(`subagent ${childId} done \\(completed\\)`))

  // 3) start a turn and interrupt it while the CLI process is running.
  await call('send_message', { agent_id: childId, message: 'Count slowly from 1 to 100 in separate lines.' })
  const deadline = Date.now() + 30_000
  while (ctx.agents.get(childId)?.status !== 'running' && Date.now() < deadline) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 20))
  }
  assert.equal(ctx.agents.get(childId)?.status, 'running', 'child must be running before interrupt')
  await call('interrupt_agent', { agent_id: childId })
  const interruptedWait = await call('wait_subagent', { subagent_id: [childId] })
  assert.match(interruptedWait, new RegExp(`subagent ${childId} done \\(aborted\\)`))

  const result = {
    passed: true,
    cli,
    model,
    profile: dir,
    home,
    checks: [
      'real-profile-boot',
      'cli-route-registered',
      'real-cli-create-wait',
      'real-cli-continue-wait',
      'real-cli-interrupt-wait',
      'host-plane-wait-subagent',
    ],
  }
  await writeFile(join(home, 'results.json'), JSON.stringify(result, null, 2))
  console.log('BETTER_SUBAGENT_CLI_SMOKE_PASSED', JSON.stringify(result))
} finally {
  if (ctx) await ctx.fiber.dispose()
}
