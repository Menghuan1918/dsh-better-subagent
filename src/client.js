/**
 * dsh-better-subagent (npm: @menghuan1918/dsh-better-subagent) — 浏览器半边：
 * 官方 Plugins 页的行配置表单。
 *
 * 宿主行导出正式 volatile Config，dsh-settings 把它投影成行配置表单；本文件注册
 * `plugins.row.config`（主键 `@menghuan1918/dsh-better-subagent#dsh-better-subagent`，
 * 与 src/config.js 的 ROW_CONFIG_KEYS 同步；Apollo 集成键并排注册同一页面），
 * 自画紧凑表单并只在保存时一次提交全部改动。零构建：
 * closure factory，只 require('react')，不 import 任何 DSH client 包；样式随组件
 * 树内一个 <style> 渲染（不写 DOM）。注册 id 必须等于 npm 包名（client closure id）。
 */

window.__ModuleLoader__.load({
	id: '@menghuan1918/dsh-better-subagent',
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const { createElement: h, cloneElement, isValidElement, useEffect, useId, useRef, useState } = require('react');

		const NS = 'better-subagent';
		// Primary key first, then the Apollo-integration compatibility keys. All
		// four render the same page over the one row config; no second store.
		const ROW_KEYS = [
			'@menghuan1918/dsh-better-subagent#dsh-better-subagent',
			'@menghuan1918/dsh-apollo#dsh-better-subagent',
			'dsh-apollo#dsh-better-subagent',
			'dsh-better-subagent#dsh-better-subagent',
		];
		const CAPABILITIES_URL = '/better-subagent/api/capabilities';
		const MODELS_URL = '/better-subagent/api/models';
		const ROUTES_URL = '/better-subagent/api/routes';
		/** 子代理模型分档（与 src/config.js 的 tiers 同步）。 */
		const TIERS = ['fast', 'quality'];
		const TIER_TITLE_KEYS = { fast: 'tierFast', quality: 'tierQuality' };
		const TIER_HINT_KEYS = { fast: 'tierFastHint', quality: 'tierQualityHint' };

		/** Codex CLI 权限档（与 src/config.js 的 CODEX_PERMISSION_MODES 同步）。 */
		const CODEX = {
			cli: 'codex',
			executable: 'codex',
			permission: 'read-only',
			permissions: ['read-only', 'workspace-write', 'danger-full-access'],
			profile: true,
		};
		/** Claude Code CLI 权限档（与 src/config.js 的 CLAUDE_PERMISSION_MODES 同步）。 */
		const CLAUDE = {
			cli: 'claude',
			executable: 'claude',
			permission: 'plan',
			permissions: ['plan', 'manual', 'dontAsk', 'acceptEdits', 'auto', 'bypassPermissions'],
			profile: false,
		};
		const BACKENDS = [CODEX, CLAUDE];

		const zh = {
			advanced: "高级",
			configureBackend: '配置 {backend}',
			modelsEmptyTitle: '配置第一个模型',
			effortsFirst: '先填写 effort',
			trustedCount: '{count} 个主机',
			behaviorTitle: '行为',
			defaults: "默认",
			customized: "已修改 {count} 项",
			readonlyDiagnostics: "诊断",
			draftPreview: "草稿预览",
			changeCount: "{count} 项改动",
			resetConfirm: "再次点击放弃",
			backendOff: "启用后配置默认模型与权限。",
			routingPreview: "路由",
			backendsTitle: "后端",
			tierFastTask: "探索 · 批量检查",
			tierQualityTask: "实现 · 调试 · 审查",
			profileChoose: "使用 Profile {profile}",
			permissionReadOnly: "只读检查，不写入文件。",
			permissionWrite: "可修改工作区文件，外部访问仍受限。",
			permissionFull: "可修改文件并访问外部资源，跳过权限确认。",
			permissionPlan: "先生成计划，执行需另行授权。",
			permissionManual: "每次敏感操作均请求确认。",
			permissionDontAsk: "无法自动批准的操作直接拒绝。",
			permissionAcceptEdits: "自动允许文件修改，其它操作仍需确认。",
			permissionAuto: "由 Claude 自动评估操作权限。",
			permissionBypass: "跳过所有权限确认。",
			trustedDefault: "仅 loopback",
			modelCatalog: "模型目录",
			diagnosticsLink: "查看连接诊断",
			tabGeneral: "概览",
			tabCli: "CLI",
			tabTiers: "模型分档",
			tabConnection: "连接",
			details: "说明",
			configured: "已启用",
			inactive: "已停用",
			scopeInactive: "范围已关闭",
			unsaved: "未保存",
			upToDate: "已同步",
			trustedHostsLabel: "受信主机",
			trustedHostsHint: "每行一个主机名或 host:port，不含协议和路径。留空时仅允许 loopback。只影响本插件的只读 API；设置写入权限仍由宿主控制。",
			invalidTrustedHosts: "受信主机格式有误，请填写主机名或 host:port。",
			connectionMode: "配置连接",
			connectionWritable: "可写",
			connectionReadonly: "只读",
			capabilitiesLabel: "CLI 探测",
			routesLabel: "模型白名单",
			refresh: "刷新探测",
			ready: "可用",
			failed: "读取失败",
			modelCount: "{count} 个模型",
			saveBeforeDiscover: "先保存可执行文件 / Profile，再刷新探测或发现模型。",
			permissionElevated: "此权限档允许绕过 CLI 的权限确认。",
			invalidTierEffort: "{backend}的 effort 不属于当前模型，请重新选择。",
			route: "路由",
			effort: "Effort",
			globalOverrides: "全部预设已启用，包含工程模式。",
			summary: '子代理路由、CLI 后端与退出守卫',
			title: '子代理',
			intro: '保存后即时生效，无需重启。配置写入当前 profile 的行配置（cordis.patch.yml）。',
			loading: '正在读取配置…',
			waitingForm: '正在等待宿主提供这一行的配置快照…',
			noFormHint: '长时间停在这里说明宿主没有为这一行提供可编辑配置：本部署没组合 dsh-settings/config-editor，或本行的 Config 未被识别。',
			unavailable: '当前连接下该配置不可用：请通过 loopback 地址访问。本插件的 trustedHosts 只影响它自己的只读 API，不能让设置镜像在反代页面变为可写；设置可用性由宿主连接策略决定。',
			readonly: '当前连接只读（设置镜像为进程内 memory），无法写入宿主配置。',
			childExitGuardLabel: '运行中子代理退出守卫',
			childExitGuardHint: '回合结束时若仍有运行中的直接子代理，注入提醒强制继续处理；用户中断（Esc）始终放行。后台命令由其它开关负责。',
			tiersTitle: '子代理模型分档',
			tiersIntro: '工程模式提示词按这里的路由告诉主代理两档各用哪个模型；候选来自「插件 → 子代理 → 模型选择」白名单。',
			tierFast: '快速档',
			tierQuality: '质量档',
			tierFastHint: '快速档：探索、侦察、机械分析、批量排查。',
			tierQualityHint: '质量档：复杂实现、调试、审查、设计。',
			tierInherit: '沿用父会话路由',
			tierEffortDefault: '模型默认',
			tierRouteLabel: '{tier}路由',
			tierEffortLabel: '{tier} effort',
			tierOffList: '(不在白名单) {route}',
			tiersInactive: '「插件 → 子代理 → 模型选择」未开启或白名单为空：分档仍作为提示词建议渲染，但实际子代理路由仍由宿主策略决定，可能被拒绝。',
			routesLoading: '正在读取子代理模型白名单…',
			routesError: '读取子代理模型白名单失败（不影响保存）。',
			invalidTierRoute: '{backend}所选路由不在子代理模型白名单内，请改选或改回沿用父会话路由。',
			scopeTitle: '接入范围',
			scopeEng: '工程模式预设',
			scopeEngHint: 'eng / eng-ptc 会话可以看到下面这些 CLI 子代理路由。',
			scopeGlobal: '全部预设',
			scopeGlobalHint: '所有预设的会话都能看到这些路由（影响面更大）。',
			scopeNone: '两个范围都关闭时，这些 CLI 路由不会出现在任何会话里。',
			codexTitle: 'Codex 后端',
			claudeTitle: 'Claude 后端',
			backendEnable: '启用',
			executableLabel: '可执行文件',
			executableHint: '只写命令名则从 PATH 查找；也可手输绝对路径或 ~ 开头的路径。',
			profileLabel: 'Profile',
			profileHint: '名称来自 CODEX_HOME 下的 <name>.config.toml 与旧式 [profiles.*] 段。',
			profileNone: '（不指定）',
			permissionLabel: '权限档',
			permissionHint: '完全由这里的设置决定，不继承会话的权限状态。',
			defaultModelLabel: '默认模型',
			defaultModelNone: '（未指定）',
			modelsLabel: '模型与 effort',
			modelsHint: '每行一个模型：id + 允许的 effort（逗号分隔）+ 默认 effort。',
			modelsEmpty: '还没有配置模型；启用后端前至少加一个模型。',
			discover: '自动发现模型',
			discovering: '正在发现…',
			discoverHint: '从本机 CLI 或 Anthropic 端点读取模型，只追加列表里还没有的条目。',
			discoverDone: '已发现 {count} 个模型，新增 {added} 个。',
			discoverFailed: '自动发现失败：{reason}',
			discoverUnknown: '未知原因',
			discoverReasonMissing: '没找到可执行文件',
			discoverReasonFailed: 'CLI 命令执行失败',
			discoverReasonNoCredentials: '没找到 ANTHROPIC_AUTH_TOKEN / ANTHROPIC_API_KEY',
			discoverReasonUnauthorized: '模型端点拒绝了凭据（HTTP {status}）',
			discoverReasonHttp: '模型端点返回 HTTP {status}',
			discoverReasonNetwork: '无法连接模型端点',
			discoverReasonParse: '返回内容不是可解析的模型清单',
			discoverReasonEmpty: '模型清单为空',
			discoverReasonTooLarge: '返回内容过大',
			modelIdPlaceholder: '模型 id',
			modelEffortsPlaceholder: 'low, medium, high',
			modelDefaultEffort: '默认 effort',
			modelEffortNone: '（无默认）',
			modelAdd: '添加模型',
			modelRemove: '移除',
			probing: '正在探测本机可执行文件…',
			detected: '已检测到 {path}（{version}）',
			detectedNoVersion: '已检测到 {path}（版本未知）',
			missing: 'PATH 上没找到 {executable}，可直接填绝对路径。',
			capabilitiesError: '读取本机探测信息失败（不影响保存）。',
			save: '保存',
			saving: '保存中…',
			reset: '放弃改动',
			saved: '已保存，即时生效。',
			conflict: '宿主拒绝了这次写入：配置可能已被其他改动更新或被更高优先级配置覆盖，已重新读取宿主值。',
			saveFailed: '保存失败：',
			invalidEmptyId: '{backend}里有模型缺少 id，请补齐后再保存。',
			invalidDuplicateId: '{backend}的模型 id 不能重复。',
			invalidNoModels: '{backend}已启用，但还没有配置任何模型。',
			invalidDefaultModel: '{backend}已启用，请把默认模型设为模型列表里的一个。',
			invalidDefaultEffort: '{backend}的默认模型需要 effort 列表，并指定一个属于它的默认 effort。',
			readonlyShort: '只读',
			readonlyNote: '只读：当前无法写入宿主配置。',
			unavailableNote: '不可写：当前连接下该配置不可用。',
		};

		const en = {
			advanced: "Advanced",
			configureBackend: 'Configure {backend}',
			modelsEmptyTitle: 'Set up your first model',
			effortsFirst: 'Add efforts first',
			trustedCount: '{count} hosts',
			behaviorTitle: 'Behavior',
			defaults: "Default",
			customized: "{count} customized",
			readonlyDiagnostics: "Diagnostics",
			draftPreview: "Draft preview",
			changeCount: "{count} changes",
			resetConfirm: "Click again to discard",
			backendOff: "Enable to configure its default model and permissions.",
			routingPreview: "Routing",
			backendsTitle: "Backends",
			tierFastTask: "Explore · Batch checks",
			tierQualityTask: "Implement · Debug · Review",
			profileChoose: "Use Profile {profile}",
			permissionReadOnly: "Inspect files without writing.",
			permissionWrite: "Edit workspace files with restricted external access.",
			permissionFull: "Edit files and access external resources without approval prompts.",
			permissionPlan: "Plan first; execution requires separate approval.",
			permissionManual: "Request approval for each sensitive operation.",
			permissionDontAsk: "Reject operations that cannot be approved automatically.",
			permissionAcceptEdits: "Allow file edits; other operations still require approval.",
			permissionAuto: "Let Claude assess operation permissions.",
			permissionBypass: "Skip all permission prompts.",
			trustedDefault: "Loopback only",
			modelCatalog: "Model catalog",
			diagnosticsLink: "View connection diagnostics",
			tabGeneral: "Overview",
			tabCli: "CLI",
			tabTiers: "Model tiers",
			tabConnection: "Connection",
			details: "Details",
			configured: "Enabled",
			inactive: "Disabled",
			scopeInactive: "Scope off",
			unsaved: "Unsaved changes",
			upToDate: "Up to date",
			trustedHostsLabel: "Trusted hosts",
			trustedHostsHint: "One hostname or host:port per line, without scheme or path. Empty allows loopback only. Applies to this plugin’s read-only API; the host controls settings write access.",
			invalidTrustedHosts: "Enter a hostname or host:port for each trusted host.",
			connectionMode: "Settings connection",
			connectionWritable: "Writable",
			connectionReadonly: "Read-only",
			capabilitiesLabel: "CLI detection",
			routesLabel: "Model allowlist",
			refresh: "Refresh detection",
			ready: "Available",
			failed: "Request failed",
			modelCount: "{count} models",
			saveBeforeDiscover: "Save the executable / Profile before refreshing detection or discovering models.",
			permissionElevated: "This permission mode can bypass CLI approval prompts.",
			invalidTierEffort: "The {backend} effort is unavailable for this model. Select another.",
			route: "Route",
			effort: "Effort",
			globalOverrides: "All presets includes the eng preset.",
			summary: 'Subagent routes, CLI backends and the exit guard',
			title: 'Subagents',
			intro: 'Saving applies immediately, no restart. Values persist in the active profile row config (cordis.patch.yml).',
			loading: 'Loading configuration…',
			waitingForm: 'Waiting for the host to provide this row’s configuration snapshot…',
			noFormHint: 'Staying here means the host exposes no editable config for this row: dsh-settings/config-editor is not composed, or this row’s Config was not recognized.',
			unavailable: 'This configuration is unavailable on the current connection: use a loopback address. This plugin’s trustedHosts only affects its own read-only API; it cannot make the settings mirror writable on a proxied page — settings availability is decided by the host connection policy.',
			readonly: 'This connection is read-only (settings mirror is process-local memory); host configuration cannot be written.',
			childExitGuardLabel: 'Child exit guard',
			childExitGuardHint: 'Blocks turn end while direct subagents are still running; interrupt (Esc) always passes through. Background jobs are owned by other switches.',
			tiersTitle: 'Subagent model tiers',
			tiersIntro: 'The eng mode prompt tells the main agent which route each tier uses; candidates come from the Plugins → Subagent → Model selection allowlist.',
			tierFast: 'Fast tier',
			tierQuality: 'Quality tier',
			tierFastHint: 'Fast tier: exploration, reconnaissance, mechanical analysis, batch checks.',
			tierQualityHint: 'Quality tier: complex implementation, debugging, review, design.',
			tierInherit: 'Inherit parent route',
			tierEffortDefault: 'Model default',
			tierRouteLabel: '{tier} route',
			tierEffortLabel: '{tier} effort',
			tierOffList: '(not allowlisted) {route}',
			tiersInactive: 'Plugins → Subagent → Model selection is off or its allowlist is empty: the tiers still render as prompt guidance, but actual child routes remain subject to host policy and may be rejected.',
			routesLoading: 'Loading the subagent model allowlist…',
			routesError: 'Could not read the subagent model allowlist (saving still works).',
			invalidTierRoute: 'The {backend} route is not in the subagent model allowlist: pick another or inherit the parent route.',
			scopeTitle: 'Scope',
			scopeEng: 'Eng preset',
			scopeEngHint: 'eng / eng-ptc sessions see the CLI subagent routes below.',
			scopeGlobal: 'All presets',
			scopeGlobalHint: 'Every preset’s sessions see these routes (broader impact).',
			scopeNone: 'With both scopes off, these CLI routes appear in no session.',
			codexTitle: 'Codex backend',
			claudeTitle: 'Claude backend',
			backendEnable: 'Enabled',
			executableLabel: 'Executable',
			executableHint: 'A bare command name is resolved from PATH; an absolute or ~ path is also accepted.',
			profileLabel: 'Profile',
			profileHint: 'Names come from <name>.config.toml under CODEX_HOME and from legacy [profiles.*] sections.',
			profileNone: '(none)',
			permissionLabel: 'Permission',
			permissionHint: 'Decided entirely by this setting; the session’s permission state is never inherited.',
			defaultModelLabel: 'Default model',
			defaultModelNone: '(unset)',
			modelsLabel: 'Models and efforts',
			modelsHint: 'One model per row: id + allowed efforts (comma separated) + default effort.',
			modelsEmpty: 'No model yet; add at least one before enabling the backend.',
			discover: 'Discover models',
			discovering: 'Discovering…',
			discoverHint: 'Reads models from the local CLI or the Anthropic endpoint; appends only entries not already listed.',
			discoverDone: 'Found {count} models, added {added}.',
			discoverFailed: 'Discovery failed: {reason}',
			discoverUnknown: 'unknown reason',
			discoverReasonMissing: 'executable not found',
			discoverReasonFailed: 'the CLI command failed',
			discoverReasonNoCredentials: 'no ANTHROPIC_AUTH_TOKEN / ANTHROPIC_API_KEY',
			discoverReasonUnauthorized: 'the model endpoint rejected the credential (HTTP {status})',
			discoverReasonHttp: 'the model endpoint answered HTTP {status}',
			discoverReasonNetwork: 'the model endpoint could not be reached',
			discoverReasonParse: 'the reply is not a parseable model list',
			discoverReasonEmpty: 'the model list is empty',
			discoverReasonTooLarge: 'the reply is too large',
			modelIdPlaceholder: 'model id',
			modelEffortsPlaceholder: 'low, medium, high',
			modelDefaultEffort: 'Default effort',
			modelEffortNone: '(none)',
			modelAdd: 'Add model',
			modelRemove: 'Remove',
			probing: 'Probing local executables…',
			detected: 'Found {path} ({version})',
			detectedNoVersion: 'Found {path} (version unknown)',
			missing: '{executable} was not found on PATH; type an absolute path if needed.',
			capabilitiesError: 'Could not read local probe data (saving still works).',
			save: 'Save',
			saving: 'Saving…',
			reset: 'Discard',
			saved: 'Saved and applied.',
			conflict: 'The host refused this write: the configuration changed elsewhere or a higher layer overrides it. Host values were reloaded.',
			saveFailed: 'Save failed: ',
			invalidEmptyId: 'Every model in {backend} needs an id before saving.',
			invalidDuplicateId: 'Model ids in {backend} must be unique.',
			invalidNoModels: '{backend} is enabled but has no model configured.',
			invalidDefaultModel: '{backend} is enabled: set the default model to one of its model ids.',
			invalidDefaultEffort: '{backend}’s default model needs an effort list and a default effort from that list.',
			readonlyShort: 'Read-only',
			readonlyNote: 'Read-only: host configuration cannot be written.',
			unavailableNote: 'Not writable: this configuration is unavailable on the current connection.',
		};

		/** 宿主发现接口的 error.code → 文案键（未知 code 回退通用原因）。 */
		const DISCOVERY_REASON_KEYS = {
			missing: 'discoverReasonMissing',
			failed: 'discoverReasonFailed',
			'no-credentials': 'discoverReasonNoCredentials',
			unauthorized: 'discoverReasonUnauthorized',
			http: 'discoverReasonHttp',
			network: 'discoverReasonNetwork',
			parse: 'discoverReasonParse',
			empty: 'discoverReasonEmpty',
			'too-large': 'discoverReasonTooLarge',
		};

		// ── 文案（locale 服务缺失时保持中文默认）───────────────────────────────

		function interpolate(text, params) {
			if (params === undefined || params === null) return text;
			return text.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
		}

		let t = (key, params) => interpolate(zh[key] ?? key, params);

		// ── 样式（组件树内的 <style>；复用 DSH 设计令牌，与官方设置页同观感）──────────

		const STYLE_ID = '@menghuan1918/dsh-better-subagent/settings.css';
		const CSS = `.bs-root{--cfg-accent:#3388BB;--cfg-accent-solid:#20709e;--cfg-accent-fg:#fff;--cfg-accent-text:#14587f;--cfg-accent-hover:#1b628c;--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 10%,transparent);--cfg-bg:var(--dsw-alias-bg-layer-1);--cfg-raised:var(--dsw-alias-bg-layer-2);--cfg-overlay:var(--dsw-alias-bg-layer-3);--cfg-sunken:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,var(--dsw-alias-bg-layer-1));--cfg-ink:var(--dsw-alias-label-primary);--cfg-muted:var(--dsw-alias-label-secondary);--cfg-dim:color-mix(in srgb,var(--dsw-alias-label-tertiary) 80%,var(--dsw-alias-label-primary));--cfg-line:var(--dsw-alias-border-l2);--cfg-line-strong:var(--dsw-alias-border-l3);--cfg-hover:var(--dsw-alias-interactive-bg-hover);--cfg-danger:var(--dsw-alias-state-error-primary);--cfg-warn:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 60%,var(--dsw-alias-label-primary));--cfg-success:color-mix(in srgb,var(--dsw-alias-state-success-primary) 60%,var(--dsw-alias-label-primary));--cfg-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--cfg-ink);font:inherit;font-size:13px;line-height:20px;min-width:0;font-variant-numeric:tabular-nums;display:flex;flex-direction:column;flex:1;min-height:0}
[data-ds-dark-theme] .bs-root{--cfg-accent:#4eb0e8;--cfg-accent-solid:#4eb0e8;--cfg-accent-fg:#0e1014;--cfg-accent-text:#6fc0ee;--cfg-accent-hover:#6fc0ee;--cfg-accent-soft:color-mix(in srgb,var(--cfg-accent) 14%,transparent)}
.bs-root,.bs-root *{box-sizing:border-box}
.bs-root [hidden]{display:none!important}
.bs-cfg{display:flex;flex-direction:column;gap:24px;max-width:920px;min-width:0;flex:1;min-height:0}
.bs-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:32px}
.bs-title{margin:0;font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-ink)}
.bs-header .bs-title{font-size:20px;line-height:28px;letter-spacing:-.01em}
.bs-sectionTitle{font-size:12px;line-height:18px;font-weight:500;color:var(--cfg-muted)}
.bs-cardTitle{margin:0;font-size:14px;line-height:20px;font-weight:500;color:var(--cfg-ink)}
.bs-hint,.bs-status{margin:0;color:var(--cfg-muted);font-size:12px;line-height:18px}
.bs-hintWarn{color:color-mix(in srgb,var(--cfg-warn) 55%,var(--cfg-ink))}
.bs-note{margin:8px 0 0;padding:8px 10px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken);color:var(--cfg-muted);font-size:12px;line-height:18px}
.bs-note[data-tone=warn]{border-color:color-mix(in srgb,var(--cfg-warn) 34%,var(--cfg-line));color:var(--cfg-ink)}
.bs-note[data-tone=error],.bs-hint[data-tone=error],.bs-status[data-tone=error]{color:var(--cfg-danger)}
.bs-hint[data-tone=ok],.bs-status[data-tone=ok]{color:color-mix(in srgb,var(--cfg-success) 55%,var(--cfg-ink))}
.bs-tabs{display:inline-flex;align-self:flex-start;gap:2px;height:32px;max-width:100%;padding:2px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken);overflow-x:auto;scrollbar-width:none}
.bs-tabs::-webkit-scrollbar{display:none}
.bs-tab{appearance:none;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;height:28px;padding:0 12px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--cfg-muted);font:inherit;font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer}
.bs-tab:hover{background:var(--cfg-hover);color:var(--cfg-ink)}
.bs-tab[aria-selected=true]{background:var(--cfg-overlay);border-color:var(--cfg-line);color:var(--cfg-accent-text)}
.bs-tab:focus-visible{outline:2px solid var(--cfg-accent);outline-offset:-2px}
.bs-subtabs{height:30px}
.bs-subtabs .bs-tab{height:26px;padding:0 10px;font-size:12px}
.bs-tabpanel{display:flex;flex-direction:column;gap:0;min-width:0}
.bs-section,.bs-card{display:flex;flex-direction:column;min-width:0;border-top:1px solid var(--cfg-line);padding:12px 0 4px}
.bs-section:first-child,.bs-card:first-child{border-top:0;padding-top:0}
.bs-sectionHead,.bs-cardHead,.bs-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.bs-sectionHead{min-height:28px;padding-bottom:4px;border-bottom:1px solid var(--cfg-line)}
.bs-cardHead{min-height:32px;padding-bottom:4px;border-bottom:1px solid var(--cfg-line)}
.bs-toolbar{justify-content:flex-start;gap:8px}
.bs-field{display:grid;grid-template-columns:180px minmax(0,1fr);gap:8px 20px;align-items:start;padding:10px 0;border-bottom:1px solid var(--cfg-line);min-width:0}
.bs-field:last-child{border-bottom:0}
.bs-fieldLabel{display:flex;align-items:center;gap:6px;min-width:0;padding-top:6px;font-size:13px;font-weight:500;color:var(--cfg-ink)}
.bs-fieldBody{display:flex;flex-direction:column;gap:6px;min-width:0}
.bs-fieldWide{grid-template-columns:minmax(0,1fr)}
.bs-fieldWide>.bs-fieldLabel{padding:0}
.bs-fieldGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:10px 0;border-bottom:1px solid var(--cfg-line);min-width:0}
.bs-fieldGrid .bs-field{display:flex;flex-direction:column;gap:6px;padding:0;border:0}
.bs-fieldGrid .bs-fieldLabel{padding:0;font-size:12px;font-weight:500;color:var(--cfg-muted)}
.bs-tierGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;min-width:0;padding:10px 0;border-bottom:1px solid var(--cfg-line)}
.bs-tierGrid .bs-field{display:flex;flex-direction:column;gap:6px;padding:0;border:0}
.bs-tierGrid .bs-fieldLabel{padding:0}
.bs-input,.bs-select,.bs-textarea{appearance:none;width:100%;min-width:0;height:32px;padding:0 10px;border:1px solid var(--cfg-line-strong);border-radius:8px;background:var(--cfg-raised);color:var(--cfg-ink);font:inherit;font-size:13px;line-height:20px;transition:border-color 140ms ease,box-shadow 140ms ease,background-color 140ms ease}
.bs-textarea{height:auto;min-height:88px;max-height:220px;padding:8px 10px;resize:vertical}
.bs-input:hover:not(:disabled),.bs-select:hover:not(:disabled),.bs-textarea:hover:not(:disabled){border-color:var(--cfg-muted)}
.bs-input:focus-visible,.bs-select:focus-visible,.bs-textarea:focus-visible{outline:none;border-color:var(--cfg-accent);box-shadow:0 0 0 2px var(--cfg-accent-soft)}
.bs-root [aria-invalid=true]{border-color:var(--cfg-danger)}
.bs-input::placeholder,.bs-textarea::placeholder{color:var(--cfg-dim)}
.bs-input:disabled,.bs-select:disabled,.bs-textarea:disabled{opacity:.4;cursor:not-allowed}
.bs-mono,.bs-model .bs-input,.bs-select,.bs-textarea{font-family:var(--cfg-mono);font-variant-numeric:tabular-nums}
.bs-mono{overflow-wrap:anywhere}
.bs-selectWrap{position:relative;min-width:0}
.bs-select{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer}
.bs-selectValue{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bs-select svg{flex:none;color:var(--cfg-dim)}
.bs-selectMenu{position:absolute;inset-inline:0;top:calc(100% + 4px);z-index:30;min-width:0;max-height:240px;overflow:auto;overscroll-behavior:contain;padding:4px;border:1px solid var(--cfg-line-strong);border-radius:10px;background:var(--cfg-overlay);box-shadow:0 12px 32px -12px rgb(0 0 0 / .35)}
.bs-selectMenu[data-side=top]{top:auto;bottom:calc(100% + 4px)}
.bs-option{display:flex;align-items:center;gap:8px;min-height:30px;padding:0 8px;border-radius:6px;color:var(--cfg-ink);cursor:pointer;overflow-wrap:anywhere}
.bs-option[data-active=true]{background:var(--cfg-hover)}
.bs-option[aria-selected=true]{background:var(--cfg-accent-soft);color:var(--cfg-accent-text)}
.bs-optionCheck{width:12px;flex:none;color:var(--cfg-accent-text)}
.bs-optionLabel{min-width:0}
.bs-switchRow{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;padding:10px 0;border-bottom:1px solid var(--cfg-line);min-width:0}
.bs-switchRow:last-child{border-bottom:0}
.bs-switchMain{flex:1;min-width:0}
.bs-switchLabel{font-size:13px;font-weight:500;color:var(--cfg-ink)}
.bs-cardHead .bs-switchRow{min-height:0;padding:0;border:0;gap:10px}
.bs-cardHead .bs-switchLabel{font-size:12px;font-weight:400;color:var(--cfg-muted)}
.bs-switch{appearance:none;position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:34px;height:20px;padding:0;border:0;border-radius:999px;background:transparent;cursor:pointer}
.bs-switchTrack{display:block;width:34px;height:20px;padding:2px;border:1px solid var(--cfg-line-strong);border-radius:999px;background:var(--cfg-sunken);transition:background-color 140ms ease,border-color 140ms ease}
.bs-switch:hover:not(:disabled) .bs-switchTrack{border-color:var(--cfg-muted)}
.bs-switch[aria-checked=true] .bs-switchTrack{background:var(--cfg-accent-solid);border-color:var(--cfg-accent-solid)}
.bs-switchThumb{display:block;width:14px;height:14px;border-radius:50%;background:var(--cfg-muted);transition:transform 140ms ease,background-color 140ms ease}
.bs-switch[aria-checked=true] .bs-switchThumb{transform:translateX(14px);background:var(--cfg-accent-fg)}
.bs-switch:focus-visible{outline:2px solid var(--cfg-accent);outline-offset:2px}
.bs-switch:disabled{opacity:.4;cursor:not-allowed}
.bs-button,.bs-iconButton{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border:1px solid transparent;border-radius:8px;font:inherit;font-size:13px;line-height:20px;font-weight:500;color:var(--cfg-ink);background:transparent;cursor:pointer;transition:background-color 140ms ease,border-color 140ms ease,color 140ms ease}
.bs-button[data-variant=outline]{border-color:var(--cfg-line-strong);background:var(--cfg-raised)}
.bs-button:hover:not(:disabled),.bs-iconButton:hover:not(:disabled){background:var(--cfg-hover)}
.bs-button[data-variant=primary]{background:var(--cfg-accent-solid);color:var(--cfg-accent-fg)}
.bs-button[data-variant=primary]:hover:not(:disabled){background:var(--cfg-accent-hover)}
.bs-iconButton{width:28px;height:28px;padding:0;border:0;border-radius:6px;color:var(--cfg-muted)}
.bs-iconButton[data-danger]:hover:not(:disabled){color:var(--cfg-danger)}
.bs-button:disabled,.bs-iconButton:disabled,.bs-root :disabled{opacity:.4;cursor:not-allowed}
.bs-button:focus-visible,.bs-iconButton:focus-visible,.bs-root summary:focus-visible{outline:2px solid var(--cfg-accent);outline-offset:2px}
.bs-models{display:flex;flex-direction:column;min-width:0}
.bs-model,.bs-modelHead{display:grid;grid-template-columns:minmax(110px,1.2fr) minmax(140px,1.4fr) minmax(110px,1fr) 28px;gap:8px;align-items:start}
.bs-modelHead{padding:8px 0;border-bottom:1px solid var(--cfg-line);color:var(--cfg-muted);font-size:12px}
.bs-model{padding:8px 0;border-top:1px solid var(--cfg-line)}
.bs-modelHead+.bs-model{border-top:0}
.bs-modelCell,.bs-tierCell{display:flex;flex-direction:column;gap:4px;min-width:0}
.bs-cellLabel{display:none;font-size:11px;line-height:16px;color:var(--cfg-muted)}
.bs-tier{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:8px 12px;align-items:start}
.bs-tierInherit{grid-template-columns:minmax(0,1fr)}
.bs-tierPurpose{grid-column:1/-1;color:var(--cfg-muted);font-size:12px;line-height:18px}
.bs-controlLabel{font-size:12px;line-height:18px;color:var(--cfg-muted)}
.bs-badge{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border:1px solid var(--cfg-line);border-radius:999px;background:var(--cfg-raised);color:var(--cfg-muted);font-size:11px;line-height:18px;font-weight:400;white-space:nowrap}
.bs-dot{width:6px;height:6px;flex:none;border-radius:50%;background:var(--cfg-dim)}
.bs-dot[data-active=true]{background:var(--cfg-accent)}
.bs-overview{display:flex;flex-direction:column;min-width:0}
.bs-overviewRow{appearance:none;display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:8px 0;border:0;border-bottom:1px solid var(--cfg-line);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.bs-overviewRow:last-child{border-bottom:0}
.bs-overviewRow:hover{background:var(--cfg-hover)}
.bs-overviewRow:focus-visible{outline:2px solid var(--cfg-accent);outline-offset:2px}
.bs-overviewGlyph{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;border:1px solid var(--cfg-line);border-radius:6px;background:var(--cfg-sunken);color:var(--cfg-muted)}
.bs-overviewName{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.bs-overviewName>span:first-child{font-weight:500}
.bs-overviewMeta{display:inline-flex;align-items:center;gap:6px;min-width:0;color:var(--cfg-muted);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.bs-overviewRow>svg{color:var(--cfg-dim);flex:none}
.bs-routing{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1.2fr);gap:12px;align-items:center;min-height:44px;padding:10px 0;border-bottom:1px solid var(--cfg-line);min-width:0}
.bs-routing:last-child{border-bottom:0}
.bs-routingLabel{font-size:13px;line-height:20px;color:var(--cfg-ink);min-width:0}
.bs-routingArrow{color:var(--cfg-dim);font-size:12px}
.bs-routingTarget{appearance:none;display:inline-flex;align-items:center;min-height:28px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--cfg-accent-text);font:inherit;font-size:13px;font-weight:500;text-align:left;overflow-wrap:anywhere;cursor:pointer}
.bs-routingTarget:hover{background:var(--cfg-hover)}
.bs-routingTarget:focus-visible{outline:2px solid var(--cfg-accent);outline-offset:2px}
.bs-empty{display:flex;flex-direction:column;gap:4px;margin:8px 0;padding:10px 12px;border:1px solid var(--cfg-line);border-radius:8px;background:var(--cfg-sunken)}
.bs-empty .bs-title{font-size:13px;font-weight:500}
.bs-actions{display:flex;flex-wrap:wrap;gap:8px;padding:10px 0}
.bs-advanced{margin-top:8px;border-top:1px solid var(--cfg-line)}
.bs-advanced>summary{display:flex;align-items:center;gap:8px;min-height:32px;padding:8px 0;list-style:none;cursor:pointer;font-size:13px;font-weight:500;color:var(--cfg-ink)}
.bs-advanced>summary::-webkit-details-marker{display:none}
.bs-advanced>summary:before{content:"";width:6px;height:6px;flex:none;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(-45deg);transition:transform 140ms ease}
.bs-advanced[open]>summary:before{transform:rotate(45deg)}
.bs-advancedSummary{margin-left:auto;color:var(--cfg-muted);font-size:12px;font-weight:400}
.bs-profileChoices{display:flex;flex-wrap:wrap;gap:6px}
.bs-profileChoices .bs-button{height:28px;padding:0 9px;border-radius:6px;font-size:12px}
.bs-diagGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:10px 0;border-bottom:1px solid var(--cfg-line);min-width:0}
.bs-metric{display:flex;flex-direction:column;gap:4px;min-width:0}
.bs-metricLabel{font-size:12px;line-height:18px;color:var(--cfg-muted)}
.bs-metricValue{display:-webkit-box;overflow:hidden;color:var(--cfg-ink);font-size:12px;line-height:18px;overflow-wrap:anywhere;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bs-connectionRow{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:36px;border-bottom:1px solid var(--cfg-line);color:var(--cfg-muted);font-size:12px}
.bs-connectionRow:last-child{border-bottom:0}
.bs-footer{position:sticky;bottom:0;z-index:10;display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 0;border-top:1px solid var(--cfg-line);background:var(--cfg-bg);margin-top:auto}
.bs-status{flex:1;min-width:140px}
.bs-feedback{display:flex;align-items:center;gap:8px;min-width:0;padding:8px 0 0;border-top:1px solid var(--cfg-line);font-size:12px}
.bs-errorLink{height:auto;min-height:28px;padding:0;border:0;color:var(--cfg-danger);font-size:12px;font-weight:400;text-align:left;white-space:normal}
.bs-errorLink:hover:not(:disabled){background:transparent;color:var(--cfg-danger)}
.bs-srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.bs-spinner{width:12px;height:12px;flex:none;border:1px solid currentColor;border-right-color:transparent;border-radius:50%;animation:bs-spin .7s linear infinite}
@keyframes bs-spin{to{transform:rotate(360deg)}}
.bs-pulse{animation:bs-pulse 2s ease infinite}
@keyframes bs-pulse{50%{opacity:.55}}
@media(max-width:640px){.bs-header .bs-title{font-size:18px}.bs-cfg{gap:20px}.bs-header,.bs-sectionHead,.bs-cardHead{flex-wrap:wrap}.bs-tabs{display:flex;width:100%;overflow-x:auto}.bs-tab{padding:0 8px;font-size:12px}.bs-subtabs .bs-tab{padding:0 8px;font-size:11px}.bs-field{grid-template-columns:minmax(0,1fr);gap:4px}.bs-fieldLabel{padding:0}.bs-fieldGrid,.bs-tierGrid{grid-template-columns:minmax(0,1fr);gap:12px}.bs-routing{grid-template-columns:minmax(0,1fr);gap:4px}.bs-routingArrow{display:none}.bs-diagGrid{grid-template-columns:minmax(0,1fr)}.bs-modelHead{display:none}.bs-model{grid-template-columns:minmax(0,1fr) 28px;gap:8px}.bs-modelCell{grid-column:1}.bs-model .bs-iconButton{grid-column:2;grid-row:1}.bs-cellLabel{display:block}.bs-footer .bs-status{flex-basis:100%}.bs-cardHead .bs-switchRow{width:auto}}
@media(pointer:coarse){.bs-button,.bs-input,.bs-select,.bs-textarea{min-height:44px}.bs-switch{width:44px;height:32px}.bs-switchTrack{width:34px;height:20px;margin:0 auto}.bs-iconButton{width:44px;height:44px}.bs-overviewRow{min-height:48px}}
@media(prefers-reduced-motion:reduce){.bs-root *{animation:none!important;transition:none!important}}`;


		// ── 取值/形状（与 src/config.js 的默认形状一致；浏览器半边不能 import 宿主模块）──

		function isRecord(value) {
			return typeof value === 'object' && value !== null && !Array.isArray(value);
		}

		function stringOr(value, fallback) {
			return typeof value === 'string' ? value : fallback;
		}

		function modelList(value) {
			if (!Array.isArray(value)) return [];
			return value.filter(isRecord).map((entry) => {
				const efforts = Array.isArray(entry.efforts) ? entry.efforts.filter((item) => typeof item === 'string') : [];
				const defaultEffort = stringOr(entry.defaultEffort, '');
				return {
					id: stringOr(entry.id, ''),
					efforts,
					// 与 src/config.js 同规则：默认 effort 必须属于该模型的 effort 列表。
					defaultEffort: efforts.indexOf(defaultEffort) >= 0 ? defaultEffort : '',
				};
			});
		}

		function backendShape(value, spec) {
			const source = isRecord(value) ? value : {};
			const backend = {
				enabled: source.enabled === true,
				executable: typeof source.executable === 'string' && source.executable.trim() !== ''
					? source.executable.trim()
					: spec.executable,
			};
			if (spec.profile) backend.profile = stringOr(source.profile, '');
			backend.permissionMode = spec.permissions.indexOf(source.permissionMode) >= 0
				? source.permissionMode
				: spec.permission;
			backend.defaultModel = stringOr(source.defaultModel, '');
			backend.models = modelList(source.models);
			return backend;
		}

		/** 一个分档：provider 或 model 为空即整档清空（与 src/config.js 同规则）。 */
		function tierShape(value) {
			const source = isRecord(value) ? value : {};
			const provider = stringOr(source.provider, '').trim();
			const model = stringOr(source.model, '').trim();
			if (provider === '' || model === '') return { provider: '', model: '', reasoningEffort: '' };
			return { provider, model, reasoningEffort: stringOr(source.reasoningEffort, '').trim() };
		}

		/** 把宿主快照值（或 undefined）规整成表单可安全读写的形状。 */
		function shape(value) {
			const source = isRecord(value) ? value : {};
			const subagents = isRecord(source.subagents) ? source.subagents : {};
			const tiers = isRecord(source.tiers) ? source.tiers : {};
			const result = {
				childExitGuard: source.childExitGuard === true,
				trustedHosts: Array.isArray(source.trustedHosts) ? [...new Set(source.trustedHosts.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))] : [],
				tiers: {},
				subagents: {
					eng: subagents.eng !== false,
					global: subagents.global === true,
				},
			};
			for (const tier of TIERS) result.tiers[tier] = tierShape(tiers[tier]);
			for (const spec of BACKENDS) result.subagents[spec.cli] = backendShape(subagents[spec.cli], spec);
			return result;
		}

		/** 逗号分隔的 effort 文本 → 去重后的字符串数组。 */
		function parseEfforts(text) {
			const result = [];
			for (const part of String(text ?? '').split(',')) {
				const trimmed = part.trim();
				if (trimmed === '' || result.indexOf(trimmed) >= 0) continue;
				result.push(trimmed);
			}
			return result;
		}

		/** 只在用户按下保存时才写入：把差异摊成一组 set 操作（数组整段替换）。 */
		function diffOps(host, current) {
			const ops = [];
			if (JSON.stringify(host.trustedHosts) !== JSON.stringify(current.trustedHosts)) {
				ops.push({ op: 'set', path: ['trustedHosts'], value: current.trustedHosts });
			}
			if (host.childExitGuard !== current.childExitGuard) {
				ops.push({ op: 'set', path: ['childExitGuard'], value: current.childExitGuard });
			}
			for (const tier of TIERS) {
				if (JSON.stringify(host.tiers[tier]) === JSON.stringify(current.tiers[tier])) continue;
				ops.push({ op: 'set', path: ['tiers', tier], value: tierShape(current.tiers[tier]) });
			}
			for (const key of ['eng', 'global']) {
				if (host.subagents[key] !== current.subagents[key]) {
					ops.push({ op: 'set', path: ['subagents', key], value: current.subagents[key] });
				}
			}
			for (const spec of BACKENDS) {
				const before = host.subagents[spec.cli];
				const after = current.subagents[spec.cli];
				for (const field of Object.keys(after)) {
					if (JSON.stringify(before[field]) === JSON.stringify(after[field])) continue;
					ops.push({ op: 'set', path: ['subagents', spec.cli, field], value: after[field] });
				}
			}
			return ops;
		}

		/**
		 * 前端校验（宿主 schema 管不到跨字段关联，这里补齐）：
		 * 模型 id 非空且唯一；**启用的**后端必须有默认模型，且该模型的 effort
		 * 列表与默认 effort 齐备——CLI 路由按这三元组选档，缺一项运行时就报错。
		 * 分档：白名单读取成功时，已选路由必须在白名单内（否则子代理派发会被策略拒绝）。
		 * @param current - 表单当前值。
		 * @param allowed - `routesOf()` 的结果；白名单未读到时为 null（不校验分档）。
		 * @returns `{ key, titleKey }`（key 用 `{backend}` 参数渲染后端/分档名），或 null。
		 */
		function validate(current, allowed) {
			for (const host of current.trustedHosts) {
				try {
					const url = new URL('http://' + host);
					if (!url.hostname || url.username || url.password || /[\s/?#@\\]/.test(host) || host.includes('://')) return { key: 'invalidTrustedHosts' };
				} catch {
					return { key: 'invalidTrustedHosts' };
				}
			}
			if (allowed !== null && allowed !== undefined) {
				for (const tier of TIERS) {
					const value = current.tiers[tier];
					if (value.provider === '' || value.model === '') continue;
					const route = findRoute(allowed.routes, value);
					if (route === undefined) {
						return { key: 'invalidTierRoute', titleKey: TIER_TITLE_KEYS[tier] };
					}
					if (value.reasoningEffort !== '' && route.efforts.length > 0 && !route.efforts.includes(value.reasoningEffort)) {
						return { key: 'invalidTierEffort', titleKey: TIER_TITLE_KEYS[tier] };
					}
				}
			}
			for (const spec of BACKENDS) {
				const backend = current.subagents[spec.cli];
				const titleKey = spec.cli === 'codex' ? 'codexTitle' : 'claudeTitle';
				const fail = (key) => ({ key, titleKey });
				if (!backend.enabled) continue;
				const ids = backend.models.map((model) => model.id.trim());
				if (ids.indexOf('') >= 0) return fail('invalidEmptyId');
				if (new Set(ids).size !== ids.length) return fail('invalidDuplicateId');
				if (backend.models.length === 0) return fail('invalidNoModels');
				const selected = backend.models.find((model) => model.id.trim() === backend.defaultModel.trim());
				if (selected === undefined) return fail('invalidDefaultModel');
				if (selected.efforts.length === 0) return fail('invalidDefaultEffort');
				if (selected.defaultEffort === '' || selected.efforts.indexOf(selected.defaultEffort) < 0) {
					return fail('invalidDefaultEffort');
				}
			}
			return null;
		}

		// ── 能力探针（host 半边的只读接口）─────────────────────────────────────

		/** 拉取一个 `/better-subagent/api/*` 只读接口；失败只降级显示，不阻塞表单。 */
		function useEndpoint(url, revision) {
			const [state, setState] = useState({ status: 'loading' });
			const [refreshKey, setRefreshKey] = useState(0);
			useEffect(() => {
				let active = true;
				const controller = typeof AbortController === 'function' ? new AbortController() : undefined;
				const done = (next) => {
					if (active) setState(next);
				};
				void (async () => {
					try {
						const res = await fetch(url, controller === undefined ? undefined : { signal: controller.signal });
						const body = await res.json().catch(() => undefined);
						if (!res.ok || body?.ok !== true) throw new Error('HTTP ' + String(res.status));
						done({ status: 'ready', value: body.value });
					} catch (error) {
						done({ status: 'error', message: String(error?.message ?? error) });
					}
				})();
				return () => {
					active = false;
					controller?.abort();
				};
			}, [url, refreshKey, revision]);
			return { ...state, reload: () => { setState({ status: 'loading' }); setRefreshKey((value) => value + 1); } };
		}

		/**
		 * `/better-subagent/api/routes` 的结果 → `{ enabled, routes }`；未读到（加载中/失败）时 null。
		 * 每条路由 `{ provider, model, efforts, defaultEffort }`。
		 */
		function routesOf(state) {
			if (state.status !== 'ready') return null;
			const value = isRecord(state.value) ? state.value : {};
			const routes = [];
			for (const entry of Array.isArray(value.routes) ? value.routes : []) {
				if (!isRecord(entry)) continue;
				const provider = stringOr(entry.provider, '').trim();
				const model = stringOr(entry.model, '').trim();
				if (provider === '' || model === '') continue;
				routes.push({
					provider,
					model,
					efforts: Array.isArray(entry.efforts) ? entry.efforts.filter((item) => typeof item === 'string' && item !== '') : [],
					defaultEffort: stringOr(entry.defaultEffort, ''),
				});
			}
			return { enabled: value.enabled === true, routes };
		}

		function findRoute(routes, tier) {
			return routes.find((route) => route.provider === tier.provider && route.model === tier.model);
		}

		/** 路由下拉的值：`provider/model`（按第一个 `/` 切回；provider id 不含 `/`）。 */
		function routeKey(route) {
			return route.provider === '' || route.model === '' ? '' : route.provider + '/' + route.model;
		}

		function parseRouteKey(key) {
			const text = String(key ?? '');
			const at = text.indexOf('/');
			if (at <= 0 || at === text.length - 1) return { provider: '', model: '' };
			return { provider: text.slice(0, at), model: text.slice(at + 1) };
		}

		/** 一行探针结论：已检测到 <路径>（版本）/ 未找到。 */
		function detectionOf(capabilities, spec, backend, translate) {
			if (capabilities.status === 'loading') return translate('probing');
			if (capabilities.status !== 'ready') return translate('capabilitiesError');
			const info = isRecord(capabilities.value?.executables) ? capabilities.value.executables[spec.cli] : undefined;
			if (typeof info?.path === 'string' && info.path !== '') {
				return typeof info.version === 'string' && info.version !== ''
					? translate('detected', { path: info.path, version: info.version })
					: translate('detectedNoVersion', { path: info.path });
			}
			return translate('missing', { executable: backend.executable });
		}

		// ── 基础控件 ───────────────────────────────────────────────────────────


		function Chevron() {
			return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true }, h('path', { d: 'm9 5 7 7-7 7' }));
		}

		function Advanced({ summary, children, detailsRef, label }) {
			return h('details', { className: 'bs-advanced', ref: detailsRef, onKeyDown: (event) => {
				if (event.key !== 'Escape' || event.defaultPrevented || !event.currentTarget.open) return;
				event.preventDefault(); event.stopPropagation();
				event.currentTarget.open = false;
				event.currentTarget.querySelector('summary')?.focus();
			} },
				h('summary', null, label ?? t('advanced'), h('span', { className: 'bs-advancedSummary' }, summary)), children);
		}

		/** Focus stays on the trigger; the active option is announced by the combobox. */
		function Select({ children: options, value, onChange, disabled, id, className, ...props }) {
			const uid = useId();
			const listId = 'bs-options-' + uid.replace(/[^a-zA-Z0-9_-]/g, '');
			const root = useRef(null);
			const trigger = useRef(null);
			const items = useRef([]);
			const search = useRef({ text: '', at: 0 });
			const [open, setOpen] = useState(false);
			const [active, setActive] = useState(0);
			const [side, setSide] = useState('bottom');
			const selected = Math.max(0, options.findIndex((option) => option.value === value));
			useEffect(() => {
				if (!open) return;
				const owner = root.current?.ownerDocument;
				const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
				owner?.addEventListener('pointerdown', outside);
				return () => owner?.removeEventListener('pointerdown', outside);
			}, [open]);
			useEffect(() => { if (open) items.current[active]?.scrollIntoView?.({ block: 'nearest' }); }, [open, active]);
			const show = (index) => {
				if (disabled || options.length === 0) return;
				const rect = trigger.current?.getBoundingClientRect();
				const height = root.current?.ownerDocument?.defaultView?.innerHeight;
				setSide(rect && height - rect.bottom < Math.min(240, options.length * 28 + 10) && rect.top > height - rect.bottom ? 'top' : 'bottom');
				setActive(index);
				setOpen(true);
			};
			const choose = (index) => {
				if (disabled || !options[index]) return;
				onChange({ target: { value: options[index].value } });
				setOpen(false);
			};
			return h('div', { className: 'bs-selectWrap', ref: root },
				h('button', { ...props, id, type: 'button', className, value, disabled, ref: trigger, role: 'combobox',
					'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-controls': listId,
					'aria-activedescendant': open ? listId + '-' + active : undefined,
					onClick: () => open ? setOpen(false) : show(selected),
					onBlur: () => setOpen(false),
					onKeyDown: (event) => {
						if (disabled || event.defaultPrevented) return;
						if (event.key === 'Escape' && open) {
							event.preventDefault(); event.stopPropagation(); setOpen(false); return;
						}
						if (event.key === 'Tab') { setOpen(false); return; }
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault(); open ? choose(active) : show(selected); return;
						}
						let next;
						if (event.key === 'ArrowDown') next = open ? Math.min(active + 1, options.length - 1) : selected;
						else if (event.key === 'ArrowUp') next = open ? Math.max(active - 1, 0) : selected;
						else if (event.key === 'Home') next = 0;
						else if (event.key === 'End') next = options.length - 1;
						else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
							const now = Date.now();
							const text = (now - search.current.at < 700 ? search.current.text : '') + event.key.toLowerCase();
							search.current = { text, at: now };
							const start = open ? active : selected;
							for (let step = 1; step <= options.length; step++) {
								const index = (start + step) % options.length;
								if (String(options[index].label).toLowerCase().startsWith(text)) { next = index; break; }
							}
						} else return;
						if (next === undefined) return;
						event.preventDefault(); open ? setActive(next) : show(next);
					},
				}, h('span', { className: 'bs-selectValue' }, options[selected]?.label ?? value),
					h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', 'aria-hidden': true }, h('path', { d: 'm4 6 4 4 4-4' }))),
				h('div', { id: listId, className: 'bs-selectMenu', role: 'listbox', hidden: !open, 'data-side': side, 'aria-label': props['aria-label'], 'aria-labelledby': id },
					options.map((option, index) => h('div', { key: option.value, id: listId + '-' + index, role: 'option', className: 'bs-option',
						'data-value': option.value, 'aria-selected': option.value === value, 'data-active': index === active,
						ref: (node) => { items.current[index] = node; },
						onPointerDown: (event) => event.preventDefault(), onPointerMove: () => setActive(index), onClick: () => choose(index),
					}, h('span', { className: 'bs-optionCheck', 'aria-hidden': true }, option.value === value ? '✓' : ''), h('span', { className: 'bs-optionLabel' }, option.label)))));
		}

		/** Controls stay mounted across tabs to preserve in-progress text. */
		function Tabs({ id, label, items, value, onChange, compact, tabRefs }) {
			const refs = useRef({});
			return h('div', { className: compact ? 'bs-tabs bs-subtabs' : 'bs-tabs', role: 'tablist', 'aria-label': label },
				items.map((item, index) => h('button', {
					key: item.id, type: 'button', className: 'bs-tab', role: 'tab',
					id: id + '-tab-' + item.id, 'aria-controls': id + '-panel-' + item.id,
					'aria-selected': value === item.id, tabIndex: value === item.id ? 0 : -1,
					ref: (node) => { refs.current[item.id] = node; if (tabRefs) tabRefs.current[item.id] = node; },
					onClick: () => onChange(item.id),
					onKeyDown: (event) => {
						let next;
						if (event.key === 'ArrowRight') next = (index + 1) % items.length;
						else if (event.key === 'ArrowLeft') next = (index + items.length - 1) % items.length;
						else if (event.key === 'Home') next = 0;
						else if (event.key === 'End') next = items.length - 1;
						else return;
						event.preventDefault();
						onChange(items[next].id);
						refs.current[items[next].id]?.focus();
					},
				}, item.active === undefined ? null : h('span', { className: 'bs-dot', 'data-active': item.active, 'aria-hidden': true }), item.label)));
		}

		function Field({ id, label, hint, showHint, wide, children }) {
			const hintId = 'bs-hint-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
			const control = hint === undefined || children === null || typeof children !== 'object'
				? children
				: Array.isArray(children)
					? children.map((child, at) => (at === 0 && isValidElement(child) ? cloneElement(child, { key: child.key ?? 'control', 'aria-describedby': hintId }) : child))
					: cloneElement(children, { 'aria-describedby': hintId });
			return h('div', { className: wide ? 'bs-field bs-fieldWide' : 'bs-field' },
				h('div', { className: 'bs-fieldLabel' },
					h(id === undefined ? 'span' : 'label', { htmlFor: id }, label)),
				h('div', { className: 'bs-fieldBody' }, control,
					hint === undefined ? null : h('p', { id: hintId, className: showHint ? 'bs-hint' : 'bs-srOnly' }, hint)));
		}

		function SwitchRow({ id, label, hint, checked, disabled, onChange }) {
			const labelId = id + '-label';
			const hintId = hint === undefined ? undefined : id + '-hint';
			return h('div', { className: 'bs-switchRow' },
				h('div', { className: 'bs-switchMain' },
					h('label', { className: 'bs-switchLabel', id: labelId, htmlFor: id }, label),
					hint === undefined ? null : h('p', { className: 'bs-srOnly', id: hintId }, hint)),
				h('button', {
					type: 'button', id, role: 'switch', className: 'bs-switch',
					'aria-checked': checked === true, 'aria-labelledby': labelId, 'aria-describedby': hintId,
					disabled: disabled === true, onClick: () => onChange(checked !== true),
				}, h('span', { className: 'bs-switchTrack', 'aria-hidden': true }, h('span', { className: 'bs-switchThumb' }))));
		}

		/** Keep delimiters while typing; normalize only the values sent to the host. */
		function HostList({ hosts, disabled, t: translate, onChange, 'aria-describedby': describedBy }) {
			const key = hosts.join('\u0000');
			const [buffer, setBuffer] = useState({ key, text: hosts.join('\n') });
			if (buffer.key !== key) setBuffer({ key, text: hosts.join('\n') });
			return h('textarea', {
				className: 'bs-textarea', id: 'bs-trusted-hosts', rows: 4,
				value: buffer.key === key ? buffer.text : hosts.join('\n'), disabled,
				spellCheck: false, autoCapitalize: 'none', autoComplete: 'off',
				placeholder: 'proxy.example.com:8443', 'aria-label': translate('trustedHostsLabel'), 'aria-describedby': describedBy,
				onChange: (event) => {
					const text = event.target.value;
					const values = [...new Set(text.split(/[\n,]+/).map((part) => part.trim()).filter(Boolean))];
					setBuffer({ key: values.join('\u0000'), text });
					onChange(values);
				},
			});
		}

		/** 下拉选项：保留当前值（外部写入的值不在候选里时也不能被静默改掉）。 */
		function optionNodes(values, current, noneLabel) {
			const nodes = [];
			if (noneLabel !== undefined) nodes.push({ value: '', label: noneLabel });
			const seen = new Set();
			for (const value of values) {
				if (typeof value !== 'string' || value === '' || seen.has(value)) continue;
				seen.add(value);
				nodes.push({ value, label: value });
			}
			if (typeof current === 'string' && current !== '' && !seen.has(current)) {
				nodes.push({ value: current, label: current });
			}
			return nodes;
		}

		/**
		 * 一个模型的编辑行：effort 用本地文本缓冲（直接回填解析结果会吃掉未输完的逗号）。
		 * 缓冲同时记住“它对应的已解析 effort 列表”。用户输入时缓冲与解析结果一起更新，
		 * 因此不会触发下面的同步；只有外部变化（删除上一行导致同 index 换成另一个模型、
		 * 宿主 revision 刷新、自动发现改写列表）才会让 key 不匹配并重置文本。
		 */
		function ModelRow({ model, index, disabled, requiredDefault, t: translate, onPatch, onRemove }) {
			const effortsKey = model.efforts.join('\u0000');
			const [buffer, setBuffer] = useState({ key: effortsKey, text: model.efforts.join(', ') });
			if (buffer.key !== effortsKey) setBuffer({ key: effortsKey, text: model.efforts.join(', ') });
			const effortsText = buffer.key === effortsKey ? buffer.text : model.efforts.join(', ');
			return h('div', { className: 'bs-model' },
				h('label', { className: 'bs-modelCell' },
					h('span', { className: 'bs-cellLabel' }, translate('modelIdPlaceholder')),
					h('input', {
						className: 'bs-input', type: 'text', value: model.id, disabled, 'data-model-id': true,
						placeholder: translate('modelIdPlaceholder'), spellCheck: false,
						'aria-label': translate('modelIdPlaceholder') + ' ' + String(index + 1),
						'aria-invalid': model.id.trim() === '',
						onChange: (event) => onPatch({ id: event.target.value }),
					})),
				h('label', { className: 'bs-modelCell' },
					h('span', { className: 'bs-cellLabel' }, translate('effort')),
					h('input', {
						className: 'bs-input', type: 'text', value: effortsText, disabled,
						placeholder: translate('modelEffortsPlaceholder'), spellCheck: false,
						'aria-label': translate('modelEffortsPlaceholder') + ' ' + String(index + 1),
						onChange: (event) => {
							const text = event.target.value;
							const efforts = parseEfforts(text);
							setBuffer({ key: efforts.join('\u0000'), text });
							onPatch({ efforts, defaultEffort: efforts.includes(model.defaultEffort) ? model.defaultEffort : '' });
						},
					})),
				h('label', { className: 'bs-modelCell' },
					h('span', { className: 'bs-cellLabel' }, translate('modelDefaultEffort')),
					h(Select, {
						className: 'bs-select', value: model.defaultEffort,
						disabled: disabled || model.efforts.length === 0,
						'aria-label': translate('modelDefaultEffort') + ' ' + String(index + 1),
						'aria-invalid': requiredDefault && !model.efforts.includes(model.defaultEffort),
						onChange: (event) => {
							const next = event.target.value;
							if (next !== '' && !model.efforts.includes(next)) return;
							onPatch({ defaultEffort: next });
						},
					}, optionNodes(model.efforts, model.defaultEffort, translate(model.efforts.length === 0 ? 'effortsFirst' : 'modelEffortNone')))),
				h('button', {
					type: 'button', className: 'bs-iconButton', 'data-danger': true,
					title: translate('modelRemove'), 'aria-label': translate('modelRemove'), disabled, onClick: onRemove,
				}, h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true },
					h('path', { d: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7' }))));
		}

		/**
		 * 一个分档：路由下拉（白名单）+ effort（路由有 effort 列表时下拉，否则文本）。
		 * 已保存但不在白名单里的路由仍作为选项保留（白名单读到时标注出来），不被静默改掉。
		 */
		function TierRow({ tier, value, allowed, disabled, t: translate, onPatch }) {
			const title = translate(TIER_TITLE_KEYS[tier]);
			const routes = allowed === null ? [] : allowed.routes;
			const current = routeKey(value);
			const selected = findRoute(routes, value);
			const routeOptions = [{ value: '', label: translate('tierInherit') }];
			for (const route of routes) {
				routeOptions.push({ value: routeKey(route), label: route.provider + ' / ' + route.model });
			}
			if (current !== '' && selected === undefined) {
				const label = value.provider + ' / ' + value.model;
				routeOptions.push({ value: current, label: allowed === null ? label : translate('tierOffList', { route: label }) });
			}
			const effortLabel = translate('tierEffortLabel', { tier: title });
			const effort = selected !== undefined && selected.efforts.length > 0
				? h(Select, {
					className: 'bs-select',
					id: 'bs-tier-' + tier + '-effort',
					'aria-label': effortLabel,
					'aria-invalid': value.reasoningEffort !== '' && !selected.efforts.includes(value.reasoningEffort),
					value: value.reasoningEffort,
					disabled: disabled || current === '',
					onChange: (event) => onPatch({ reasoningEffort: event.target.value }),
				}, optionNodes(selected.efforts, value.reasoningEffort, translate('tierEffortDefault')))
				: h('input', {
					className: 'bs-input',
					type: 'text',
					id: 'bs-tier-' + tier + '-effort',
					'aria-label': effortLabel,
					value: value.reasoningEffort,
					placeholder: translate('tierEffortDefault'),
					spellCheck: false,
					autoComplete: 'off',
					disabled: disabled || current === '',
					onChange: (event) => onPatch({ reasoningEffort: event.target.value.trim() }),
				});
			return h(Field, { id: 'bs-tier-' + tier + '-route', label: title },
				h('div', { className: current === '' ? 'bs-tier bs-tierInherit' : 'bs-tier' },
					h('span', { className: 'bs-tierPurpose' }, translate(tier === 'fast' ? 'tierFastTask' : 'tierQualityTask')),
					h('div', { className: 'bs-tierCell' },
						h('span', { className: 'bs-controlLabel' }, translate('route')),
						h(Select, {
						className: 'bs-select',
						id: 'bs-tier-' + tier + '-route',
						'aria-label': translate('tierRouteLabel', { tier: title }),
						value: current,
						disabled,
						// 换路由即清空 effort（旧值未必属于新模型）。
						onChange: (event) => onPatch({ ...parseRouteKey(event.target.value), reasoningEffort: '' }),
					}, routeOptions)),
					current === '' ? null : h('div', { className: 'bs-tierCell' }, h('label', { className: 'bs-controlLabel', htmlFor: 'bs-tier-' + tier + '-effort' }, translate('effort')), effort)));
		}

		/** Default model and permissions are primary; paths and the catalog are expert settings. */
		function BackendCard({ spec, backend, disabled, capabilities, discovery, discoveryMatches, scopeActive, t: translate, onPatch, onModelPatch, onModelAdd, onModelRemove, onDiscover, onDiagnostics, generation }) {
			const title = spec.cli === 'codex' ? 'Codex' : 'Claude';
			const status = discovery[spec.cli];
			const profileNames = capabilities.status === 'ready' && Array.isArray(capabilities.value?.codexProfiles)
				? capabilities.value.codexProfiles.filter((name) => typeof name === 'string') : [];
			const modelIds = backend.models.map((model) => model.id.trim()).filter(Boolean);
			const permissionKeys = { 'read-only': 'permissionReadOnly', 'workspace-write': 'permissionWrite', 'danger-full-access': 'permissionFull',
				plan: 'permissionPlan', manual: 'permissionManual', dontAsk: 'permissionDontAsk', acceptEdits: 'permissionAcceptEdits', auto: 'permissionAuto', bypassPermissions: 'permissionBypass' };
			const elevated = ['danger-full-access', 'bypassPermissions'].includes(backend.permissionMode);
			const modelListRef = useRef(null);
			const advancedRef = useRef(null);
			const focusNewModel = useRef(false);
			useEffect(() => {
				if (!focusNewModel.current) return;
				focusNewModel.current = false;
				const inputs = modelListRef.current?.querySelectorAll('input[data-model-id]');
				inputs?.[inputs.length - 1]?.focus();
			}, [backend.models.length]);
			const customized = Number(backend.executable !== spec.executable) + Number(Boolean(backend.profile)) + Number(backend.models.length > 0);
			return h('section', { className: 'bs-card', 'aria-label': title },
				h('div', { className: 'bs-cardHead' },
					h('h3', { className: 'bs-cardTitle' }, title),
					h(SwitchRow, { id: 'bs-' + spec.cli + '-enabled', label: translate('backendEnable'),
						checked: backend.enabled, disabled, onChange: (enabled) => onPatch({ enabled }) })),
				!backend.enabled ? h('p', { className: 'bs-srOnly' }, translate('backendOff')) : h('div', null,
					h('div', { className: 'bs-fieldGrid' },
						h(Field, { id: 'bs-' + spec.cli + '-default-model', label: translate('defaultModelLabel') },
							h(Select, { className: 'bs-select', id: 'bs-' + spec.cli + '-default-model', value: backend.defaultModel,
								disabled: disabled || modelIds.length === 0, 'aria-invalid': !modelIds.includes(backend.defaultModel.trim()),
								onChange: (event) => onPatch({ defaultModel: event.target.value }) }, optionNodes(modelIds, backend.defaultModel, translate('defaultModelNone')))),
						h(Field, { id: 'bs-' + spec.cli + '-permission', label: translate('permissionLabel'), hint: translate('permissionHint') },
							h(Select, { className: 'bs-select', id: 'bs-' + spec.cli + '-permission', value: backend.permissionMode, disabled,
								onChange: (event) => onPatch({ permissionMode: event.target.value }) }, optionNodes(spec.permissions, backend.permissionMode)),
							h('p', { className: elevated ? 'bs-hint bs-hintWarn' : 'bs-hint' }, translate(permissionKeys[backend.permissionMode])))),
					backend.models.length === 0 ? h('div', { className: 'bs-empty' },
						h('p', { className: 'bs-hint' }, translate('modelsEmpty'))) : null,
					h('div', { className: 'bs-actions' },
						h('button', { type: 'button', id: 'bs-' + spec.cli + '-discover', className: 'bs-button', 'data-variant': 'outline',
							disabled: disabled || !discoveryMatches || status?.status === 'loading', 'aria-busy': status?.status === 'loading', onClick: onDiscover },
							status?.status === 'loading' ? h('span', { className: 'bs-spinner', 'aria-hidden': true }) : null,
							status?.status === 'loading' ? translate('discovering') : translate('discover')),
						h('button', { type: 'button', id: 'bs-' + spec.cli + '-add-model', className: 'bs-button', 'data-variant': 'outline', disabled,
							onClick: () => { if (advancedRef.current) advancedRef.current.open = true; focusNewModel.current = true; onModelAdd(); } },
							h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'aria-hidden': true }, h('path', { d: 'M12 5v14M5 12h14' })), translate('modelAdd')),
						h('button', { type: 'button', className: 'bs-button', onClick: onDiagnostics }, translate('diagnosticsLink'))),
					!discoveryMatches ? h('p', { className: 'bs-hint' }, translate('saveBeforeDiscover')) : null,
					status?.text ? h('p', { className: 'bs-hint', role: status.status === 'error' ? 'alert' : 'status', 'data-tone': status.status === 'error' ? 'error' : 'ok' }, status.text) : null,
					h(Advanced, { detailsRef: advancedRef, summary: customized ? translate('customized', { count: customized }) : translate('defaults') },
						h(Field, { id: 'bs-' + spec.cli + '-executable', label: translate('executableLabel'), hint: translate('executableHint') },
							h('input', { className: 'bs-input bs-mono', type: 'text', id: 'bs-' + spec.cli + '-executable',
								value: backend.executable, placeholder: spec.executable, spellCheck: false, autoComplete: 'off', disabled,
								onChange: (event) => onPatch({ executable: event.target.value }) })),
						spec.profile ? h(Field, { id: 'bs-' + spec.cli + '-profile', label: translate('profileLabel'), hint: translate('profileHint') },
							h('input', { className: 'bs-input bs-mono', id: 'bs-' + spec.cli + '-profile', value: backend.profile,
								placeholder: translate('profileNone'), autoComplete: 'off', spellCheck: false, disabled, onChange: (event) => onPatch({ profile: event.target.value }) }),
							h('div', { className: 'bs-profileChoices', id: 'bs-' + spec.cli + '-profiles' }, profileNames.map((profile) => h('button', {
								key: profile, type: 'button', className: 'bs-button bs-mono', disabled, 'aria-label': translate('profileChoose', { profile }),
								'aria-pressed': backend.profile === profile, onClick: () => onPatch({ profile }),
							}, profile)))) : null,
						h(Field, { wide: true, label: translate('modelsLabel'), hint: translate('modelsHint') + ' ' + translate('discoverHint') },
							backend.models.length === 0 ? null : h('div', { className: 'bs-models', ref: modelListRef },
								h('div', { className: 'bs-modelHead', 'aria-hidden': true }, h('span', null, translate('modelIdPlaceholder')), h('span', null, translate('effort')), h('span', null, translate('modelDefaultEffort')), h('span')),
								backend.models.map((model, index) => h(ModelRow, { key: generation + ':' + index, model, index, disabled,
									requiredDefault: model.id.trim() === backend.defaultModel.trim(), t: translate,
									onPatch: (patch) => onModelPatch(index, patch), onRemove: () => onModelRemove(index) })))))));
		}


		/** 行配置页面主体。 */
		function BetterSubagentConfigPage({ form, t: translate }) {
			const state = form?.state;
			const revision = state?.revision;
			const capabilities = useEndpoint(CAPABILITIES_URL, revision);
			const routesState = useEndpoint(ROUTES_URL, revision);
			const allowed = routesOf(routesState);
			const [draft, setDraft] = useState(null);
			const [generation, setGeneration] = useState(0);
			const [busy, setBusy] = useState(false);
			const [notice, setNotice] = useState(null);
			const [discardFor, setDiscardFor] = useState(null);
			useEffect(() => {
				if (notice?.tone !== 'ok') return;
				const timer = setTimeout(() => setNotice(null), 4000);
				return () => clearTimeout(timer);
			}, [notice]);
			/** 每个后端的发现状态：`{ status: 'loading' | 'ok' | 'error', text? }`。 */
			const [discovery, setDiscovery] = useState({});
			const [tab, setTab] = useState('general');
			const [backendTab, setBackendTab] = useState('codex');
			const navigationTabs = useRef({});
			const latest = useRef(null);
			const requests = useRef({});

			const host = state?.status === 'ready' ? shape(state.value) : null;
			const live = draft !== null && draft.revision === revision ? draft.value : host;
			latest.current = { revision, generation, backends: live?.subagents };
			const writable = state?.status === 'ready' && state?.writable === true && state?.mode !== 'memory';
			const dirty = live !== null && host !== null && JSON.stringify(live) !== JSON.stringify(host);
			const invalid = live === null ? null : validate(live, allowed);
			const changeCount = dirty ? diffOps(host, live).length : 0;
			const dirtyKey = JSON.stringify(live);

			if (state === undefined) {
				// 官方页面在镜像读到该命名空间前不传 form：这是正常加载窗口，
				// 长期停在这里才说明本部署缺少 settings/config-editor。
				return h('div', { className: 'bs-cfg' },
					h('p', { className: 'bs-note bs-pulse', role: 'status', title: translate('noFormHint') }, translate('waitingForm')));
			}
			if (state.status === 'loading') {
				return h('div', { className: 'bs-cfg' },
					h('p', { className: 'bs-note bs-pulse', role: 'status' }, translate('loading')));
			}
			if (host === null) {
				return h('div', { className: 'bs-cfg' },
					h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('unavailable')));
			}

			/** 记一次草稿修改（函数式叠加：连续编辑不丢改动；换 revision 即失效）。 */
			const edit = (mutate) => {
				setDiscardFor(null);
				setDraft((previous) => {
					const base = previous !== null && previous.revision === revision ? previous.value : live;
					return { revision, value: mutate(base) };
				});
				setNotice(null);
			};
			const patchTier = (tier, patch) => edit((current) => ({
				...current,
				tiers: { ...current.tiers, [tier]: { ...current.tiers[tier], ...patch } },
			}));
			const patchBackend = (spec, patch) => edit((current) => ({
				...current,
				subagents: {
					...current.subagents,
					[spec.cli]: { ...current.subagents[spec.cli], ...patch },
				},
			}));
			/** 按 index 做函数式补丁：不依赖触发那一帧的数组快照。 */
			const patchModel = (spec, index, patch) => edit((current) => {
				const backend = current.subagents[spec.cli];
				const models = backend.models.map((model, at) => (at === index ? { ...model, ...patch } : model));
				const renamedDefault = patch.id !== undefined && backend.models[index].id.trim() === backend.defaultModel.trim();
				const defaultModel = renamedDefault ? patch.id.trim() : backend.defaultModel;
				return { ...current, subagents: { ...current.subagents, [spec.cli]: { ...backend, models, defaultModel } } };
			});
			const addModel = (spec) => edit((current) => {
				const backend = current.subagents[spec.cli];
				return {
					...current,
					subagents: {
						...current.subagents,
						[spec.cli]: { ...backend, models: [...backend.models, { id: '', efforts: [], defaultEffort: '' }] },
					},
				};
			});
			const removeModel = (spec, index) => edit((current) => {
				const backend = current.subagents[spec.cli];
				return {
					...current,
					subagents: {
						...current.subagents,
						[spec.cli]: { ...backend,
							models: backend.models.filter((model, at) => at !== index),
							defaultModel: backend.models[index].id.trim() === backend.defaultModel.trim() ? '' : backend.defaultModel,
						},
					},
				};
			});
			/** 发现失败原因：只认宿主给的 error.code，不回显可能含凭据的细节。 */
			const discoveryReason = (error) => {
				const key = DISCOVERY_REASON_KEYS[String(error?.code ?? '')];
				if (key === undefined) return translate('discoverUnknown');
				return translate(key, { status: String(error?.status ?? '') });
			};
			/** 拉取发现结果并并入草稿：保留已有条目，只追加新 id。 */
			const discoverModels = async (spec) => {
				if (discovery[spec.cli]?.status === 'loading' || !writable || busy) return;
				const backend = live.subagents[spec.cli];
				const request = { revision, generation, executable: backend.executable, profile: backend.profile };
				requests.current[spec.cli] = request;
				const stale = () => latest.current.revision !== request.revision || latest.current.generation !== request.generation
					|| latest.current.backends?.[spec.cli].executable !== request.executable
					|| latest.current.backends?.[spec.cli].profile !== request.profile;
				setDiscovery((previous) => ({ ...previous, [spec.cli]: { status: 'loading' } }));
				try {
					const response = await fetch(MODELS_URL + '?cli=' + encodeURIComponent(spec.cli));
					const body = await response.json().catch(() => undefined);
					if (requests.current[spec.cli] !== request || stale()) return;
					if (!response.ok || body?.ok !== true) throw new Error('HTTP ' + String(response.status));
					const value = isRecord(body.value) ? body.value : {};
					const found = modelList(value.models).filter((model) => model.id.trim() !== '');
					if (found.length === 0) {
						setDiscovery((previous) => ({
							...previous,
							[spec.cli]: {
								status: 'error',
								text: translate('discoverFailed', { reason: discoveryReason(value.error) }),
							},
						}));
						return;
					}
					const known = new Set(live.subagents[spec.cli].models
						.map((model) => model.id.trim()).filter((id) => id !== ''));
					const added = found.filter((model) => !known.has(model.id)).length;
					edit((current) => {
						const backend = current.subagents[spec.cli];
						const existing = new Set(backend.models
							.map((model) => model.id.trim()).filter((id) => id !== ''));
						const models = [...backend.models];
						for (const model of found) {
							if (existing.has(model.id)) continue;
							existing.add(model.id);
							models.push(model);
						}
						const defaultModel = backend.defaultModel.trim() !== '' ? backend.defaultModel : (models[0]?.id ?? '');
						return {
							...current,
							subagents: {
								...current.subagents,
								[spec.cli]: { ...backend, models, defaultModel },
							},
						};
					});
					setDiscovery((previous) => ({
						...previous,
						[spec.cli]: {
							status: 'ok',
							text: translate('discoverDone', { count: found.length, added }),
						},
					}));
				} catch (error) {
					if (requests.current[spec.cli] !== request || stale()) return;
					setDiscovery((previous) => ({
						...previous,
						[spec.cli]: {
							status: 'error',
							text: translate('discoverFailed', { reason: String(error?.message ?? error) }),
						},
					}));
				} finally {
					if (requests.current[spec.cli] === request && stale()) {
						setDiscovery((previous) => ({ ...previous, [spec.cli]: undefined }));
					}
				}
			};
			const save = async () => {
				if (busy || !dirty || invalid !== null || !writable) return;
				const ops = diffOps(host, live);
				if (ops.length === 0) return;
				setBusy(true);
				setNotice(null);
				try {
					const accepted = await form.mutate(ops, revision);
					if (accepted) {
						// 草稿保留：mirror 折叠后 revision 前进、草稿自动失效（避免回显旧值闪烁）。
						setNotice({ tone: 'ok', text: translate('saved') });
						navigationTabs.current[tab]?.focus();
					} else {
						setDraft(null);
						setGeneration((value) => value + 1);
						setNotice({ tone: 'warn', text: translate('conflict') });
					}
				} catch (error) {
					setNotice({ tone: 'error', text: translate('saveFailed') + String(error?.message ?? error) });
				} finally {
					setBusy(false);
				}
			};
			const reset = () => {
				if (changeCount > 3 && discardFor !== dirtyKey) { setDiscardFor(dirtyKey); return; }
				setDiscardFor(null);
				navigationTabs.current[tab]?.focus();
				requests.current = {};
				setDiscovery({});
				setDraft(null);
				setGeneration((value) => value + 1);
				setNotice(null);
			};

			const scopeActive = live.subagents.eng || live.subagents.global;
			const navigate = (next, cli) => {
				setTab(next); if (cli) setBackendTab(cli);
				navigationTabs.current[next]?.focus();
			};
			const invalidTab = invalid?.titleKey?.startsWith('tier') ? 'tiers' : invalid?.titleKey ? 'cli' : 'connection';
			const status = notice !== null
				? h('span', { className: 'bs-status', 'data-tone': notice.tone, role: notice.tone === 'error' ? 'alert' : 'status' }, notice.text)
				: invalid !== null
					? h('span', { className: 'bs-status', role: 'alert' }, h('button', { type: 'button', className: 'bs-button bs-errorLink',
						onClick: () => navigate(invalidTab, invalid.titleKey === 'claudeTitle' ? 'claude' : 'codex') },
						translate(invalid.key, { backend: invalid.titleKey ? translate(invalid.titleKey) : '' })))
					: null;
			const panelProps = (name) => ({ id: 'bs-settings-panel-' + name, className: 'bs-tabpanel', role: 'tabpanel',
				'aria-labelledby': 'bs-settings-tab-' + name, tabIndex: 0, hidden: tab !== name });
			return h('div', { className: 'bs-cfg', 'data-settings-dirty': dirty, 'data-settings-busy': busy },
				h('div', { className: 'bs-header' }, h('h2', { className: 'bs-title' }, translate('title')),
					writable ? null : h('span', { className: 'bs-badge', role: 'status', title: translate('readonly') }, translate('readonlyShort'))),
				h(Tabs, { id: 'bs-settings', label: translate('title'), value: tab, onChange: setTab, tabRefs: navigationTabs, items: [
					{ id: 'general', label: translate('tabGeneral') }, { id: 'cli', label: translate('tabCli') },
					{ id: 'tiers', label: translate('tabTiers') }, { id: 'connection', label: translate('tabConnection') }] }),
				h('div', panelProps('general'),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title bs-sectionTitle' }, translate('routingPreview'))),
						...TIERS.map((tier) => h('div', { key: tier, className: 'bs-routing' },
							h('span', { className: 'bs-routingLabel' }, translate(tier === 'fast' ? 'tierFastTask' : 'tierQualityTask')),
							h('span', { className: 'bs-routingArrow', 'aria-hidden': true }, '→'),
							h('button', { type: 'button', className: 'bs-routingTarget bs-mono', onClick: () => navigate('tiers') },
								routeKey(live.tiers[tier]) || translate('tierInherit'))))),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title bs-sectionTitle' }, translate('backendsTitle'))),
						h('div', { className: 'bs-overview' }, BACKENDS.map((spec) => {
							const backend = live.subagents[spec.cli];
							const title = spec.cli === 'codex' ? 'Codex' : 'Claude';
							return h('button', { key: spec.cli, type: 'button', id: 'bs-open-' + spec.cli, className: 'bs-overviewRow',
								'aria-label': translate('configureBackend', { backend: title }), onClick: () => navigate('cli', spec.cli) },
								h('span', { className: 'bs-overviewGlyph', 'aria-hidden': true }, h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M4 5h16v14H4Zm4 5 2 2-2 2m5 0h3' }))),
								h('span', { className: 'bs-overviewName' },
									h('span', null, title),
									h('span', { className: 'bs-overviewMeta' },
										h('span', { className: 'bs-dot', 'data-active': backend.enabled && scopeActive, 'aria-hidden': true }),
										h('span', null, backend.enabled ? translate('modelCount', { count: backend.models.length }) : translate('inactive')),
										backend.enabled && backend.defaultModel ? h('span', { className: 'bs-mono' }, ' · ' + backend.defaultModel) : null)),
								h(Chevron));
						}))),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title bs-sectionTitle' }, translate('scopeTitle'))),
						h(SwitchRow, { id: 'bs-scope-eng', label: translate('scopeEng'), hint: translate('scopeEngHint'),
							checked: live.subagents.global ? true : live.subagents.eng, disabled: !writable || busy || live.subagents.global,
							onChange: (eng) => edit((current) => ({ ...current, subagents: { ...current.subagents, eng } })) }),
						h(SwitchRow, { id: 'bs-scope-global', label: translate('scopeGlobal'), hint: translate('scopeGlobalHint'), checked: live.subagents.global,
							disabled: !writable || busy, onChange: (global) => edit((current) => ({ ...current, subagents: { ...current.subagents, global } })) }),
						!scopeActive ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('scopeNone')) : null),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title bs-sectionTitle' }, translate('behaviorTitle'))),
						h(SwitchRow, { id: 'bs-child-exit-guard', label: translate('childExitGuardLabel'), hint: translate('childExitGuardHint'),
							checked: live.childExitGuard, disabled: !writable || busy, onChange: (childExitGuard) => edit((current) => ({ ...current, childExitGuard })) }))),
				h('div', panelProps('cli'),
					h(Tabs, { id: 'bs-backend', label: translate('tabCli'), compact: true, value: backendTab, onChange: setBackendTab,
						items: BACKENDS.map((spec) => ({ id: spec.cli, label: spec.cli === 'codex' ? 'Codex' : 'Claude', active: live.subagents[spec.cli].enabled && scopeActive })) }),
					...BACKENDS.map((spec) => h('div', { key: spec.cli, id: 'bs-backend-panel-' + spec.cli, role: 'tabpanel',
						'aria-labelledby': 'bs-backend-tab-' + spec.cli, tabIndex: 0, hidden: backendTab !== spec.cli },
						h(BackendCard, { spec, backend: live.subagents[spec.cli], disabled: !writable || busy, capabilities, discovery,
							discoveryMatches: live.subagents[spec.cli].executable === host.subagents[spec.cli].executable && live.subagents[spec.cli].profile === host.subagents[spec.cli].profile,
							scopeActive, t: translate, generation, onPatch: (patch) => patchBackend(spec, patch), onModelPatch: (index, patch) => patchModel(spec, index, patch),
							onModelAdd: () => addModel(spec), onModelRemove: (index) => removeModel(spec, index), onDiscover: () => discoverModels(spec), onDiagnostics: () => navigate('connection') })))),
				h('div', panelProps('tiers'),
					h('section', { className: 'bs-section' },
						routesState.status === 'loading' ? h('p', { className: 'bs-hint', role: 'status' }, translate('routesLoading'))
							: allowed === null ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('routesError'))
								: !allowed.enabled || allowed.routes.length === 0 ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('tiersInactive')) : null,
						h('div', { className: 'bs-tierGrid' },
							...TIERS.map((tier) => h(TierRow, { key: tier, tier, value: live.tiers[tier], allowed, disabled: !writable || busy,
								t: translate, onPatch: (patch) => patchTier(tier, patch) }))))),
				h('div', panelProps('connection'),
					h('section', { className: 'bs-section' },
						h(Advanced, { label: translate('trustedHostsLabel'), summary: live.trustedHosts.length ? translate('trustedCount', { count: live.trustedHosts.length }) : translate('trustedDefault') },
							h(Field, { id: 'bs-trusted-hosts', label: translate('trustedHostsLabel'), hint: translate('trustedHostsHint') },
								h(HostList, { key: generation, hosts: live.trustedHosts, disabled: !writable || busy, t: translate,
									onChange: (trustedHosts) => edit((current) => ({ ...current, trustedHosts })) })))),
					h('section', { className: 'bs-section', 'aria-label': translate('readonlyDiagnostics') },
						h('div', { className: 'bs-sectionHead' },
							h('div', { className: 'bs-toolbar' }, h('h3', { className: 'bs-title bs-sectionTitle' }, translate('readonlyDiagnostics'))),
							h('button', { type: 'button', id: 'bs-refresh', className: 'bs-button', 'data-variant': 'outline',
								disabled: capabilities.status === 'loading' || routesState.status === 'loading', 'aria-busy': capabilities.status === 'loading' || routesState.status === 'loading',
								onClick: () => { capabilities.reload(); routesState.reload(); } }, translate('refresh'))),
						h('div', { className: 'bs-diagGrid' },
							h('div', { className: 'bs-metric' }, h('span', { className: 'bs-metricLabel' }, translate('connectionMode')),
								h('span', { className: 'bs-metricValue' }, translate(writable ? 'connectionWritable' : 'connectionReadonly'))),
							...BACKENDS.map((spec) => {
								const detection = detectionOf(capabilities, spec, host.subagents[spec.cli], translate);
								return h('div', { key: spec.cli, className: 'bs-metric' },
									h('span', { className: 'bs-metricLabel' }, spec.cli === 'codex' ? 'Codex' : 'Claude'),
									h('span', { className: 'bs-metricValue bs-mono', role: 'status', title: detection }, detection));
							})),
						h('div', { className: 'bs-connectionRow' }, h('span', null, translate('routesLabel')),
							h('span', { className: 'bs-hint', role: 'status' }, routesState.status === 'loading' ? translate('loading')
								: allowed === null ? translate('failed') : !allowed.enabled ? translate('inactive') : translate('modelCount', { count: allowed.routes.length }))))),
				notice !== null || invalid !== null ? h('div', { className: 'bs-feedback' }, status) : null,
				dirty ? h('div', { className: 'bs-footer' },
					h('span', { className: 'bs-status' }, translate('changeCount', { count: changeCount })),
					h('button', { type: 'button', className: 'bs-button', 'data-variant': 'outline', disabled: busy, onClick: reset },
						translate(discardFor === dirtyKey ? 'resetConfirm' : 'reset')),
					h('button', { type: 'button', className: 'bs-button', 'data-variant': 'primary', disabled: !writable || busy || invalid !== null,
						'aria-busy': busy, onClick: () => void save() }, busy ? h('span', { className: 'bs-spinner', 'aria-hidden': true }) : null,
						busy ? translate('saving') : translate('save'))) : null);
		}

		/**
		 * 行配置入口：`summary` 只回一行描述；`page` 渲染样式表 + 表单主体。
		 * 样式随组件树内的 <style> 挂载一次（不写 DOM，重复渲染不重复注入）。
		 */
		function BetterSubagentPanel(props) {
			if (props.view === 'summary') return h('span', null, t('summary'));
			return h('div', { className: 'bs-root' },
				h('style', { 'data-plugin-css': STYLE_ID }, CSS),
				h(BetterSubagentConfigPage, { form: props.form, t: props.t ?? t }));
		}

		const inject = ['slots', 'locale'];

		function apply(ctx) {
			try {
				const dispose = ctx.locale.register(NS, { zh, en });
				t = ctx.locale.bind(NS);
				ctx.effect(() => dispose, '@menghuan1918/dsh-better-subagent: dictionaries');
			} catch {
				// locale 服务缺失时保持中文默认。
			}
			ctx.effect(() => ctx.slots.inject('plugins.row.config', () => {
				const disposers = [];
				for (const key of ROW_KEYS) {
					try {
						const dispose = ctx.slots.register({
							name: 'plugins.row.config',
							key,
							locale: NS,
						}, BetterSubagentPanel);
						if (typeof dispose === 'function') disposers.push(dispose);
					} catch {
						// 一个键被槽账本拒绝时，另一个键仍应注册。
					}
				}
				return () => {
					for (const dispose of disposers) dispose();
				};
			}), '@menghuan1918/dsh-better-subagent: row config page');
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	},
});
