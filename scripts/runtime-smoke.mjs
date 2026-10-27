/**
 * Real-profile runtime smoke for dsh-better-subagent.
 *
 * Boots an isolated headless DSH profile from the installed host packages with
 * this package installed as a plain (unbuilt) plugin, then exercises the real
 * host lifecycle through the real tools:
 *
 *   native subagent create → wait_subagent → send_message continue →
 *   wait_subagent → interrupt_agent → wait_subagent
 *
 * It also verifies the per-Agent prompt sections are registered on the live
 * host (`ctx.systemPrompt.assemble`) and that wait_subagent is a host-plane
 * tool. No external CLI is started: CLI end-to-end needs real codex/claude
 * credentials and is reported separately by the implementation node.
 *
 * Run:
 *   DSH_PACKAGE_ROOT="/…/node_modules/@deepseek-ai/dsh" node scripts/runtime-smoke.mjs
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
const packageName = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).name
const home = await mkdtemp(join(tmpdir(), 'dsh-better-subagent-smoke-'))
process.env.DSH_HOME = home
process.env.DSH_TELEMETRY_DISABLED = '1'

const A = await import(pathToFileURL(join(dirname(dsh), 'dsh-app-boot/lib/index.js')))
const dir = A.resolveProfileDir('it', home)
A.initProfile(dir, [...A.PROFILE_TEMPLATES.headless.bundles, packageName])
const packageFile = join(dir, 'package.json')
const manifest = JSON.parse(await readFile(packageFile, 'utf8'))
const modules = join(dir, 'node_modules')
await mkdir(join(modules, '@menghuan1918'), { recursive: true })
// Exercise the published layout: copy only shipped files, with peers resolved
// from the same runtime the host uses. No copied node_modules or .git.
const plugin = join(modules, '@menghuan1918', 'dsh-better-subagent')
await mkdir(plugin, { recursive: true })
for (const name of ['package.json', 'src', 'docs', 'cordis.patch.yml', 'LICENSE', 'README.md', 'third-party']) {
  await cp(join(root, name), join(plugin, name), { recursive: true })
}
await symlink(dirname(dsh), join(modules, '@deepseek-ai'))
manifest.dependencies[packageName] = `file:${plugin}`
await writeFile(packageFile, JSON.stringify(manifest, null, 2))

await writeFile(join(dir, 'cordis.patch.yml'), JSON.stringify([
  // Do not auto-run the headless one-shot task; drive the Agent directly.
  { id: 'headless-startup', disabled: true },
  { id: 'headless-runner', disabled: true },
  { id: 'credentials', disabled: false, config: { watch: false } },
  // Row config: opt into the global subagent scope with one (unused) CLI
  // backend so the CLI catalog prompt renders; nothing spawns codex here.
  {
    id: 'dsh-better-subagent',
    config: {
      subagents: {
        global: true,
        codex: {
          enabled: true,
          executable: 'codex',
          defaultModel: 'noop',
          models: [{ id: 'noop', efforts: ['low'], defaultEffort: 'low' }],
        },
      },
    },
  },
]))

const { runProfile } = await import(pathToFileURL(join(dsh, 'lib/profile-boot.js')))
const { createUserMessage } = await import(pathToFileURL(join(dirname(dsh), 'dsh-llm/lib/index.js')))
let ctx
try {
  const booted = await runProfile({ profile: 'it', patchFiles: [], args: [], environment: A.loadLayeredEnv('dsh') })
  ctx = booted.ctx

  // Scripted provider: parent and children turn text answers. The optional
  // `slow` session id holds a turn open until interrupted.
  const slowSessions = new Set()
  const streams = []
  const adapter = {
    providerInfo: (id) => ({ id, name: 'Better Subagent smoke adapter' }),
    providerRetryPolicy: () => undefined,
    imageRequestPricing: () => undefined,
    listModels: async () => [{ provider: 'it-noop', id: 'noop', name: 'Noop', inputModalities: ['text'] }],
    resolveModel: async (provider, id) => ({ provider, id, name: id, inputModalities: ['text'] }),
    async prepareCall(provider, model) {
      return { model: await adapter.resolveModel(provider, model), stream: (options) => adapter.stream(options) }
    },
    async *stream(options) {
      streams.push(options.sessionId)
      if (slowSessions.has(options.sessionId)) {
        await new Promise((resolveWait, reject) => {
          const timer = setTimeout(resolveWait, 30_000)
          options.signal?.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(options.signal.reason ?? new Error('aborted'))
          }, { once: true })
        })
      }
      yield { type: 'block-start', index: 0, blockType: 'text' }
      yield { type: 'text-delta', index: 0, text: 'Smoke response.' }
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Smoke response.' } }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  ctx.llm.registerAdapter(['it-noop'], adapter)

  const created = await ctx.agents.create({
    sessionId: randomUUID(),
    meta: { cwd: home },
    agentOptions: { provider: 'it-noop', model: 'noop' },
    setup: async () => {},
  })
  const agent = created.agent
  const tool = (name) => {
    const definition = ctx.tools.get(name, agent)
    assert.ok(definition, `${name} must be visible to the Agent`)
    return definition
  }
  const call = async (name, args, { signal = new AbortController().signal } = {}) => {
    tool(name)
    const result = await ctx.tools.execute({ name, arguments: args, agent, signal, callId: randomUUID() })
    assert.equal(result.isError, false, `${name} failed: ${JSON.stringify(result.error ?? result.content)}`)
    return result.value
  }

  // Host-plane wait_subagent + prompt sections on the live host.
  assert.equal(typeof tool('wait_subagent').execute, 'function')
  const assembly = await ctx.systemPrompt.assemble({ agent, scope: agent })
  const sectionNames = assembly.sections.map((section) => section.name)
  assert.ok(sectionNames.includes('better-subagent:delegation'), 'per-agent delegation section')
  assert.ok(sectionNames.includes('better-subagent:cli-subagents'), 'per-agent CLI catalog section')
  const delegation = assembly.sections.find((section) => section.name === 'better-subagent:delegation').text
  assert.match(delegation, /## Delegation/)
  assert.match(delegation, /## Subagent model tiers/)
  const catalog = assembly.sections.find((section) => section.name === 'better-subagent:cli-subagents').text
  assert.match(catalog, /provider="codex"/)
  assert.match(catalog, /codex — Codex CLI/)

  // 1) create a native continuable subagent through the real subagent tool.
  const activation = await call('subagent', {
    description: 'smoke child',
    prompt: 'First smoke turn.',
  })
  assert.equal(activation.kind, 'activation')
  const childId = activation.subagentId
  assert.equal(typeof childId, 'string')

  // 2) wait for the first turn to settle (short done line, not child content).
  const firstWait = await call('wait_subagent', { subagent_id: [childId] })
  assert.match(firstWait, new RegExp(`subagent ${childId} done \\(completed\\)`))
  assert.doesNotMatch(firstWait, /Smoke response/)

  // 3) continue the same durable child, then wait again.
  await call('send_message', { agent_id: childId, message: 'Second smoke turn.' })
  const secondWait = await call('wait_subagent', { subagent_id: [childId] })
  assert.match(secondWait, new RegExp(`subagent ${childId} done \\(completed\\)`))

  // 4) interrupt a running child, then wait for its aborted settlement.
  const slow = await call('subagent', { description: 'slow smoke child', prompt: 'Slow smoke turn.' })
  const slowId = slow.subagentId
  slowSessions.add(slowId)
  const deadline = Date.now() + 10_000
  while (ctx.agents.get(slowId)?.status !== 'running' && Date.now() < deadline) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 50))
  }
  assert.equal(ctx.agents.get(slowId)?.status, 'running', 'slow child must be running before interrupt')
  await call('interrupt_agent', { agent_id: slowId })
  const interruptedWait = await call('wait_subagent', { subagent_id: [slowId] })
  assert.match(interruptedWait, new RegExp(`subagent ${slowId} done \\(aborted\\)`))

  // The parent agent's own inbox was never touched by wait_subagent: it can
  // still finish a normal turn and go idle.
  agent.followup(createUserMessage({ content: [{ type: 'text', text: 'Parent smoke turn.' }], source: { kind: 'user' } }))
  await agent.whenIdle()

  const result = {
    passed: true,
    profile: dir,
    home,
    checks: [
      'real-profile-boot',
      'host-plane-wait-subagent',
      'per-agent-prompt-sections',
      'native-create-wait',
      'continue-wait',
      'interrupt-wait',
      'no-external-cli',
    ],
    cliE2E: 'not-run (no codex/claude credentials asserted)',
  }
  await writeFile(join(home, 'results.json'), JSON.stringify(result, null, 2))
  console.log('BETTER_SUBAGENT_RUNTIME_SMOKE_PASSED', JSON.stringify(result))
} finally {
  if (ctx) await ctx.fiber.dispose()
}
