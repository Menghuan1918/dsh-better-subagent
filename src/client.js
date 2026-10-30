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
		const { createElement: h, cloneElement, useEffect, useId, useRef, useState } = require('react');

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
			tabGeneral: "概览",
			tabCli: "CLI",
			tabTiers: "模型分档",
			tabConnection: "连接",
			details: "说明",
			configured: "已启用",
			modelsEmptyTitle: "配置第一个模型",
			effortsFirst: "先填写 effort",
			configureBackend: "配置 {backend}",
			behaviorTitle: "运行行为",
			connectionIntro: "查看连接状态，管理只读 API 的受信主机。",
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
			summary: '子代理模型分档、Codex/Claude CLI 后端、接入范围与运行中子代理退出守卫',
			title: '子代理',
			intro: '管理 CLI 后端、模型分档与子代理行为。',
			loading: '正在读取配置…',
			waitingForm: '正在等待宿主提供这一行的配置快照…',
			noFormHint: '长时间停在这里说明宿主没有为这一行提供可编辑配置：本部署没组合 dsh-settings/config-editor，或本行的 Config 未被识别。',
			unavailable: '当前连接下该配置不可用：请通过 loopback 地址访问。本插件的 trustedHosts 只影响它自己的只读 API，不能让设置镜像在反代页面变为可写；设置可用性由宿主连接策略决定。',
			readonly: '当前连接只读（设置镜像为进程内 memory），无法写入宿主配置。',
			childExitGuardLabel: '运行中子代理退出守卫',
			childExitGuardHint: '等待运行中的直接子代理完成；Esc 中断始终可用。',
			tiersTitle: '子代理模型分档',
			tiersIntro: '为工程模式选择两档模型，候选来自子代理模型白名单。',
			tierFast: '快速档',
			tierQuality: '质量档',
			tierFastHint: '探索、机械分析与批量排查',
			tierQualityHint: '复杂实现、调试与审查',
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
			readonlyNote: '只读：当前无法写入宿主配置。',
			unavailableNote: '不可写：当前连接下该配置不可用。',
		};

		const en = {
			tabGeneral: "Overview",
			tabCli: "CLI",
			tabTiers: "Model tiers",
			tabConnection: "Connection",
			details: "Details",
			configured: "Enabled",
			modelsEmptyTitle: "Set up your first model",
			effortsFirst: "Add efforts first",
			configureBackend: "Configure {backend}",
			behaviorTitle: "Run behavior",
			connectionIntro: "Check your connection and manage trusted hosts for the read-only API.",
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
			summary: 'Subagent model tiers, Codex/Claude CLI backends, scope, and the running-child exit guard',
			title: 'Subagents',
			intro: 'Manage CLI backends, model tiers, and subagent behavior.',
			loading: 'Loading configuration…',
			waitingForm: 'Waiting for the host to provide this row’s configuration snapshot…',
			noFormHint: 'Staying here means the host exposes no editable config for this row: dsh-settings/config-editor is not composed, or this row’s Config was not recognized.',
			unavailable: 'This configuration is unavailable on the current connection: use a loopback address. This plugin’s trustedHosts only affects its own read-only API; it cannot make the settings mirror writable on a proxied page — settings availability is decided by the host connection policy.',
			readonly: 'This connection is read-only (settings mirror is process-local memory); host configuration cannot be written.',
			childExitGuardLabel: 'Child exit guard',
			childExitGuardHint: 'Wait for running direct subagents before ending a turn. Esc can always interrupt.',
			tiersTitle: 'Subagent model tiers',
			tiersIntro: 'Choose two model tiers for eng mode from the subagent model allowlist.',
			tierFast: 'Fast tier',
			tierQuality: 'Quality tier',
			tierFastHint: 'Exploration, mechanical analysis, and batch checks',
			tierQualityHint: 'Complex implementation, debugging, and review',
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
		const CSS = [
			".bs-root{--bs-accent:#3388BB;--bs-accent-fill:color-mix(in srgb,var(--bs-accent) 85%,black);--bs-accent-fg:#fff;--dsw-alias-button-primary-fill:var(--bs-accent-fill);--dsw-alias-button-primary-hover:color-mix(in srgb,var(--bs-accent) 75%,black);--dsw-alias-label-primary-foreground:var(--bs-accent-fg);--bs-muted:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;min-width:0}",
			".bs-root *{box-sizing:border-box}.bs-root [hidden]{display:none!important}.bs-cfg{display:flex;flex-direction:column;gap:24px;max-width:960px;min-width:0;padding:8px 0}.bs-srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}",
			".bs-header,.bs-sectionHead,.bs-cardHead,.bs-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px}.bs-header{align-items:flex-start}.bs-heading{display:flex;flex-direction:column;gap:4px}.bs-title{margin:0;font-size:14px;line-height:20px;font-weight:500}.bs-header .bs-title{font-size:18px;line-height:26px}.bs-hint,.bs-status{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}.bs-description{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}",
			".bs-note{margin:0;padding:8px 12px;border:0.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-2);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}.bs-note[data-tone=error],.bs-hint[data-tone=error],.bs-status[data-tone=error]{color:var(--dsw-alias-state-error-primary)}.bs-note[data-tone=warn]{border-inline-start:2px solid var(--dsw-alias-state-warn-primary,var(--dsw-alias-label-secondary))}.bs-hint[data-tone=ok],.bs-status[data-tone=ok]{color:var(--dsw-alias-state-success-primary)}",
			".bs-tabs{display:flex;gap:24px;padding:0;border-bottom:0.5px solid var(--dsw-alias-border-l2);overflow-x:auto;scrollbar-width:thin;max-width:100%}.bs-tab{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;padding:0 0 9px;border:0;border-radius:0;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13px;line-height:20px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background-color 100ms ease,color 100ms ease}.bs-tab:hover{color:var(--dsw-alias-label-primary)}.bs-tab[aria-selected=true]{color:var(--bs-accent)}.bs-tab[aria-selected=true]::after{content:\"\";position:absolute;inset-inline:0;bottom:0;height:2px;border-radius:2px;background:var(--bs-accent)}.bs-subtabs{align-self:flex-start;gap:2px;padding:2px;border:0;border-radius:10px;background:var(--dsw-alias-bg-layer-2)}.bs-subtabs .bs-tab{min-height:28px;padding:4px 12px;border-radius:8px;font-weight:400;color:var(--dsw-alias-label-secondary)}.bs-subtabs .bs-tab:hover{background:var(--bs-muted)}.bs-subtabs .bs-tab[aria-selected=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:inset 0 0 0 0.5px var(--dsw-alias-border-l3)}.bs-subtabs .bs-tab[aria-selected=true]::after{display:none}.bs-tabpanel{display:flex;flex-direction:column;gap:32px;min-width:0}",
			".bs-section,.bs-card{display:flex;flex-direction:column;gap:24px;min-width:0;background:transparent}.bs-section+.bs-section{padding-top:24px;border-top:0.5px solid var(--dsw-alias-border-l2)}.bs-sectionHead{min-height:24px}.bs-cardHead{padding-bottom:12px;border-bottom:0.5px solid var(--dsw-alias-border-l2)}.bs-cardTitle{margin:0;font-size:14px;line-height:20px;font-weight:500}.bs-cardHead .bs-switchRow{padding:0;gap:12px;min-height:32px}.bs-cardHead .bs-switchLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}.bs-backendSettings{display:flex;flex-direction:column;gap:24px;padding:0}.bs-modelSection{display:flex;flex-direction:column;gap:16px;padding-top:24px;border-top:0.5px solid var(--dsw-alias-border-l2)}",
			".bs-field{position:relative;display:grid;grid-template-columns:144px minmax(0,1fr);gap:12px 24px;align-items:start}.bs-fieldLabel{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding-top:7px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}.bs-fieldLabel>.bs-hint{font-weight:400}.bs-fieldBody{display:flex;flex-direction:column;gap:4px;min-width:0}.bs-fieldWide{grid-template-columns:minmax(0,1fr)}.bs-fieldWide>.bs-fieldLabel{padding:0}.bs-fieldBody>.bs-input,.bs-fieldBody>.bs-select{max-width:560px}",
			".bs-input,.bs-select,.bs-textarea{width:100%;min-width:0;height:32px;padding:5px 10px;border:0.5px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;line-height:20px;transition:border-color 100ms ease,background-color 100ms ease}.bs-select{padding-right:8px}.bs-textarea{height:auto;min-height:96px;max-height:280px;resize:vertical}.bs-input:hover:not(:disabled),.bs-select:hover:not(:disabled),.bs-textarea:hover:not(:disabled){border-color:var(--dsw-alias-border-l4)}.bs-input::placeholder,.bs-textarea::placeholder{color:var(--dsw-alias-label-dimmed)}.bs-input[aria-invalid=true],.bs-select[aria-invalid=true],.bs-textarea[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}",
			".bs-root :is(input,select,textarea,button,summary,a,[tabindex]):focus{outline:none}.bs-root :is(input,select,textarea,button,summary,a,[tabindex]):focus-visible{outline:2px solid var(--bs-accent);outline-offset:3px}.bs-root :is(input,select,textarea,button):disabled{opacity:.4;cursor:not-allowed}.bs-mono,.bs-model .bs-input,.bs-textarea{font-family:var(--dsw-font-family-mono,ui-monospace,SFMono-Regular,Consolas,monospace);font-variant-numeric:tabular-nums}.bs-mono{overflow-wrap:anywhere}",
			".bs-switchRow{position:relative;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:40px;padding:4px 0}.bs-switchMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.bs-switchLabel{font-weight:500;cursor:pointer}.bs-switch{display:flex;align-items:center;justify-content:center;flex:none;width:36px;height:32px;padding:0;border:0;border-radius:6px;background:transparent;cursor:pointer}.bs-switchTrack{display:block;width:36px;height:20px;padding:2px;border:1px solid var(--dsw-alias-border-l3);border-radius:12px;background:var(--dsw-alias-bg-layer-3);transition:background-color 150ms ease}.bs-switch:hover:not(:disabled){background:var(--bs-muted)}.bs-switch:hover:not(:disabled) .bs-switchTrack{border-color:var(--dsw-alias-border-l4)}.bs-switch:active:not(:disabled){background:var(--bs-muted)}.bs-switch[aria-checked=true] .bs-switchTrack{background:var(--bs-accent);border-color:var(--bs-accent)}.bs-switchThumb{display:block;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform 150ms ease}.bs-switch[aria-checked=true] .bs-switchThumb{transform:translateX(16px);background:var(--bs-accent-fg)}",
			".bs-actions{display:flex;flex-wrap:wrap;gap:8px}.bs-button,.bs-iconButton{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:32px;padding:5px 12px;border:0.5px solid transparent;border-radius:6px;font:inherit;font-size:13px;line-height:20px;font-weight:400;color:var(--dsw-alias-label-primary);background:transparent;cursor:pointer;transition:background-color 100ms ease}.bs-button[data-variant=outline]{border-color:var(--dsw-alias-border-l3)}.bs-button:hover:not(:disabled),.bs-iconButton:hover:not(:disabled){background:var(--bs-muted)}.bs-button:active:not(:disabled),.bs-iconButton:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active,var(--bs-muted))}.bs-button[data-variant=primary]{background:var(--bs-accent-fill);color:var(--bs-accent-fg)}.bs-button[data-variant=primary]:hover:not(:disabled){background:color-mix(in srgb,var(--bs-accent) 75%,black)}.bs-button[data-variant=primary]:active:not(:disabled){background:color-mix(in srgb,var(--bs-accent) 65%,black)}.bs-iconButton{width:32px;flex:none;padding:6px;color:var(--dsw-alias-label-secondary)}.bs-iconButton[data-danger]:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}",
			".bs-models{display:flex;flex-direction:column;gap:0}.bs-model,.bs-modelHead{display:grid;grid-template-columns:minmax(112px,1.3fr) minmax(112px,1fr) minmax(104px,.8fr) 32px;gap:12px;align-items:start}.bs-model{padding:12px 0;border-top:0.5px solid var(--dsw-alias-border-l2)}.bs-modelHead{padding-bottom:8px;font-size:12px;color:var(--dsw-alias-label-tertiary)}.bs-modelCell{display:flex;flex-direction:column;gap:4px;min-width:0}.bs-cellLabel{display:none;font-size:12px;color:var(--dsw-alias-label-secondary)}.bs-empty{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:16px;border:0.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-2)}.bs-empty svg{color:var(--dsw-alias-label-tertiary)}.bs-emptyTitle{margin:0;font-size:14px;line-height:20px;font-weight:500}.bs-tierRow{display:grid;grid-template-columns:160px minmax(0,1fr);gap:24px;padding:16px 0}.bs-tierRow+.bs-tierRow{border-top:0.5px solid var(--dsw-alias-border-l2)}.bs-tierIntro{display:flex;flex-direction:column;gap:4px}.bs-tier{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px}.bs-tierCell{display:flex;flex-direction:column;gap:4px;min-width:0}.bs-controlLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".bs-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border:0.5px solid var(--dsw-alias-border-l2);border-radius:4px;font-size:12px;line-height:18px;font-weight:400;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);white-space:nowrap}.bs-dot{width:6px;height:6px;flex:none;border-radius:50%;background:var(--dsw-alias-label-dimmed)}.bs-dot[data-active=true]{background:var(--bs-accent)}.bs-overview{display:flex;flex-direction:column}.bs-overviewRow{display:flex;align-items:center;gap:16px;width:100%;padding:12px 8px;border:0;border-bottom:0.5px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left;transition:background-color 100ms ease}.bs-overviewRow:first-child{border-top:0.5px solid var(--dsw-alias-border-l2)}.bs-overviewRow:hover{background:var(--bs-muted)}.bs-overviewRow:active{background:var(--bs-muted)}.bs-overviewName{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}.bs-overviewName>span:first-child{font-weight:500}.bs-overviewRow>svg{color:var(--dsw-alias-label-tertiary);flex:none}.bs-connectionRow{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:16px 0;border-bottom:0.5px solid var(--dsw-alias-border-l2)}.bs-connectionStatus{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".bs-footer{position:sticky;bottom:0;z-index:1;display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:16px 0;border-top:0.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}.bs-status{flex:1;min-width:144px}.bs-footer>.bs-status{margin-right:auto}.bs-errorLink{padding:0;min-height:24px;color:var(--dsw-alias-state-error-primary);text-align:left;white-space:normal;justify-content:flex-start;font-size:12px;font-weight:400}.bs-pulse{animation:bs-pulse 2s ease infinite}@keyframes bs-pulse{50%{opacity:.55}}",
			"@media(max-width:640px){.bs-header{gap:12px}.bs-tabs{gap:20px}.bs-subtabs{gap:2px}.bs-field,.bs-tierRow{grid-template-columns:minmax(0,1fr);gap:8px}.bs-fieldLabel{padding:0}.bs-sectionHead,.bs-toolbar{flex-wrap:wrap;gap:12px}.bs-modelHead{display:none}.bs-model{grid-template-columns:minmax(0,1fr) 32px;gap:12px;padding:16px 0}.bs-modelCell{grid-column:1}.bs-cellLabel{display:block}.bs-model .bs-iconButton{grid-column:2;grid-row:1}.bs-footer>.bs-status{flex-basis:100%}.bs-connectionRow{gap:12px;flex-wrap:wrap}.bs-tier{grid-template-columns:minmax(0,1fr);gap:12px}.bs-overviewRow{gap:12px;flex-wrap:wrap}.bs-cardHead{gap:12px}.bs-modelSection .bs-actions{width:100%}.bs-modelSection .bs-actions>.bs-button{flex:1}.bs-tabpanel{gap:24px}}",
			"@media(prefers-reduced-motion:reduce){.bs-root *{animation:none!important;transition:none!important}}",
		].join('\n');


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
				const ids = backend.models.map((model) => model.id.trim());
				if (ids.indexOf('') >= 0) return fail('invalidEmptyId');
				if (new Set(ids).size !== ids.length) return fail('invalidDuplicateId');
				if (!backend.enabled) continue;
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

		/** Native controls stay mounted across tabs to preserve in-progress text. */
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
					? children.map((child, at) => (at === 0 ? cloneElement(child, { key: child.key ?? 'control', 'aria-describedby': hintId }) : child))
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
					hint === undefined ? null : h('p', { className: 'bs-hint', id: hintId }, hint)),
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
			if (noneLabel !== undefined) nodes.push(h('option', { key: '__none', value: '' }, noneLabel));
			const seen = new Set();
			for (const value of values) {
				if (typeof value !== 'string' || value === '' || seen.has(value)) continue;
				seen.add(value);
				nodes.push(h('option', { key: value, value }, value));
			}
			if (typeof current === 'string' && current !== '' && !seen.has(current)) {
				nodes.push(h('option', { key: current, value: current }, current));
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
					h('select', {
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
			const routeOptions = [h('option', { key: '__inherit', value: '' }, translate('tierInherit'))];
			for (const route of routes) {
				routeOptions.push(h('option', { key: routeKey(route), value: routeKey(route) }, route.provider + ' / ' + route.model));
			}
			if (current !== '' && selected === undefined) {
				const label = value.provider + ' / ' + value.model;
				routeOptions.push(h('option', { key: current, value: current },
					allowed === null ? label : translate('tierOffList', { route: label })));
			}
			const effortLabel = translate('tierEffortLabel', { tier: title });
			const effort = selected !== undefined && selected.efforts.length > 0
				? h('select', {
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
			return h('div', { className: 'bs-tierRow' },
				h('div', { className: 'bs-tierIntro' }, h('label', { className: 'bs-title', htmlFor: 'bs-tier-' + tier + '-route' }, title),
					h('p', { className: 'bs-hint' }, translate(TIER_HINT_KEYS[tier]))),
				h('div', { className: 'bs-tier' },
					h('div', { className: 'bs-tierCell' },
						h('label', { className: 'bs-controlLabel', htmlFor: 'bs-tier-' + tier + '-route' }, translate('route')),
						h('select', {
						className: 'bs-select',
						id: 'bs-tier-' + tier + '-route',
						'aria-label': translate('tierRouteLabel', { tier: title }),
						value: current,
						disabled,
						// 换路由即清空 effort（旧值未必属于新模型）。
						onChange: (event) => onPatch({ ...parseRouteKey(event.target.value), reasoningEffort: '' }),
					}, routeOptions)),
					h('div', { className: 'bs-tierCell' }, h('label', { className: 'bs-controlLabel', htmlFor: 'bs-tier-' + tier + '-effort' }, translate('effort')), effort)));
		}

		/** CLI settings and models share the same draft. */
		function BackendCard({ spec, backend, disabled, capabilities, discovery, discoveryMatches, scopeActive, t: translate, onPatch, onModelPatch, onModelAdd, onModelRemove, onDiscover, generation }) {
			const title = spec.cli === 'codex' ? 'Codex' : 'Claude';
			const status = discovery[spec.cli];
			const profileNames = capabilities.status === 'ready' && Array.isArray(capabilities.value?.codexProfiles)
				? capabilities.value.codexProfiles.filter((name) => typeof name === 'string') : [];
			const modelIds = backend.models.map((model) => model.id.trim()).filter(Boolean);
			const elevated = ['danger-full-access', 'bypassPermissions'].includes(backend.permissionMode);
			const modelListRef = useRef(null);
			const focusNewModel = useRef(false);
			useEffect(() => {
				if (!focusNewModel.current) return;
				focusNewModel.current = false;
				const inputs = modelListRef.current?.querySelectorAll('input[data-model-id]');
				inputs?.[inputs.length - 1]?.focus();
			}, [backend.models.length]);
			return h('section', { className: 'bs-card', 'aria-label': title },
				h('div', { className: 'bs-cardHead' },
					h('h3', { className: 'bs-cardTitle' }, title),
					h(SwitchRow, { id: 'bs-' + spec.cli + '-enabled', label: translate('backendEnable'),
						checked: backend.enabled, disabled, onChange: (enabled) => onPatch({ enabled }) })),
				backend.enabled && !scopeActive ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('scopeNone')) : null,
				h('div', { className: 'bs-backendSettings' },
					h(Field, { id: 'bs-' + spec.cli + '-executable', label: translate('executableLabel'), hint: translate('executableHint') },
						h('input', { className: 'bs-input bs-mono', type: 'text', id: 'bs-' + spec.cli + '-executable',
							value: backend.executable, placeholder: spec.executable, spellCheck: false, autoComplete: 'off', disabled,
							onChange: (event) => onPatch({ executable: event.target.value }) }),
						h('p', { className: 'bs-hint bs-mono', role: 'status' }, discoveryMatches ? detectionOf(capabilities, spec, backend, translate) : translate('saveBeforeDiscover'))),
					spec.profile ? h(Field, { id: 'bs-' + spec.cli + '-profile', label: translate('profileLabel'), hint: translate('profileHint') },
						h('input', { className: 'bs-input bs-mono', id: 'bs-' + spec.cli + '-profile', list: 'bs-' + spec.cli + '-profiles',
							value: backend.profile, placeholder: translate('profileNone'), autoComplete: 'off', spellCheck: false, disabled,
							onChange: (event) => onPatch({ profile: event.target.value }) }),
						h('datalist', { id: 'bs-' + spec.cli + '-profiles' }, optionNodes(profileNames, backend.profile))) : null,
					h(Field, { id: 'bs-' + spec.cli + '-permission', label: translate('permissionLabel'), hint: translate('permissionHint') },
						h('select', { className: 'bs-select', id: 'bs-' + spec.cli + '-permission', value: backend.permissionMode, disabled,
							onChange: (event) => onPatch({ permissionMode: event.target.value }) }, optionNodes(spec.permissions, backend.permissionMode)),
						elevated ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('permissionElevated')) : null)),
				h('div', { className: 'bs-modelSection' },
					h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title' }, translate('modelsLabel')),
						h('div', { className: 'bs-actions' },
							h('button', { type: 'button', id: 'bs-' + spec.cli + '-discover', className: 'bs-button', 'data-variant': 'outline',
								title: translate('discoverHint'), disabled: disabled || !discoveryMatches || status?.status === 'loading', onClick: onDiscover },
								status?.status === 'loading' ? translate('discovering') : translate('discover')),
							h('button', { type: 'button', id: 'bs-' + spec.cli + '-add-model', className: 'bs-button', 'data-variant': 'outline', disabled,
								onClick: () => { focusNewModel.current = true; onModelAdd(); } },
								h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true }, h('path', { d: 'M12 5v14M5 12h14' })), translate('modelAdd')))),
					h(Field, { id: 'bs-' + spec.cli + '-default-model', label: translate('defaultModelLabel') },
						h('select', { className: 'bs-select', id: 'bs-' + spec.cli + '-default-model', value: backend.defaultModel,
							disabled: disabled || modelIds.length === 0,
							'aria-invalid': backend.enabled && !modelIds.includes(backend.defaultModel.trim()),
							onChange: (event) => onPatch({ defaultModel: event.target.value }) }, optionNodes(modelIds, backend.defaultModel, translate('defaultModelNone')))),
					h('div', { ref: modelListRef }, backend.models.length === 0
						? h('div', { className: 'bs-empty' },
							h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true }, h('path', { d: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5' })),
							h('p', { className: 'bs-emptyTitle' }, translate('modelsEmptyTitle')),
							h('p', { className: 'bs-hint' }, translate('modelsEmpty')))
						: h('div', { className: 'bs-models' },
							h('div', { className: 'bs-modelHead', 'aria-hidden': true },
								h('span', null, translate('modelIdPlaceholder')), h('span', null, translate('effort')),
								h('span', null, translate('modelDefaultEffort')), h('span')),
							backend.models.map((model, index) => h(ModelRow, { key: generation + ':' + index, model, index, disabled,
								requiredDefault: backend.enabled && model.id.trim() === backend.defaultModel.trim(), t: translate,
								onPatch: (patch) => onModelPatch(index, patch), onRemove: () => onModelRemove(index) })))),
					status?.text ? h('p', { className: 'bs-hint', role: 'status', 'data-tone': status.status === 'error' ? 'error' : status.status === 'ok' ? 'ok' : undefined }, status.text) : null));
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

			if (state === undefined) {
				// 官方页面在镜像读到该命名空间前不传 form：这是正常加载窗口，
				// 长期停在这里才说明本部署缺少 settings/config-editor。
				return h('div', { className: 'bs-cfg' },
					h('p', { className: 'bs-note bs-pulse', role: 'status' }, translate('waitingForm')),
					h('p', { className: 'bs-hint' }, translate('noFormHint')));
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
				requests.current = {};
				setDiscovery({});
				setDraft(null);
				setGeneration((value) => value + 1);
				setNotice(null);
			};

			const scopeActive = live.subagents.eng || live.subagents.global;
			const navigate = (next, cli) => {
				setTab(next);
				if (cli) setBackendTab(cli);
				navigationTabs.current[next]?.focus();
			};
			const invalidTab = invalid?.titleKey?.startsWith('tier') ? 'tiers' : invalid?.titleKey ? 'cli' : 'connection';
			const status = notice !== null
				? h('span', { className: 'bs-status', 'data-tone': notice.tone, role: notice.tone === 'error' ? 'alert' : 'status' }, notice.text)
				: invalid !== null
					? h('span', { className: 'bs-status', role: 'alert' }, h('button', { type: 'button', className: 'bs-button bs-errorLink',
						onClick: () => navigate(invalidTab, invalid.titleKey === 'claudeTitle' ? 'claude' : 'codex') },
						translate(invalid.key, { backend: invalid.titleKey ? translate(invalid.titleKey) : '' })))
					: h('span', { className: 'bs-status', role: 'status' }, !writable ? translate('readonlyNote') : dirty ? translate('unsaved') : '');
			const panelProps = (name) => ({ id: 'bs-settings-panel-' + name, className: 'bs-tabpanel', role: 'tabpanel',
				'aria-labelledby': 'bs-settings-tab-' + name, tabIndex: 0, hidden: tab !== name });
			return h('div', { className: 'bs-cfg' },
				h('div', { className: 'bs-header' }, h('h2', { className: 'bs-title' }, translate('title'))),
				writable ? null : h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('readonly')),
				h(Tabs, { id: 'bs-settings', label: translate('title'), value: tab, onChange: setTab, tabRefs: navigationTabs, items: [
					{ id: 'general', label: translate('tabGeneral') }, { id: 'cli', label: translate('tabCli') },
					{ id: 'tiers', label: translate('tabTiers') }, { id: 'connection', label: translate('tabConnection') }] }),
				h('div', panelProps('general'),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title' }, translate('tabCli'))),
						h('div', { className: 'bs-overview' }, BACKENDS.map((spec) => {
							const backend = live.subagents[spec.cli];
							const title = spec.cli === 'codex' ? 'Codex' : 'Claude';
							return h('button', { key: spec.cli, type: 'button', id: 'bs-open-' + spec.cli, className: 'bs-overviewRow',
								'aria-label': translate('configureBackend', { backend: title }), onClick: () => navigate('cli', spec.cli) },
								h('span', { className: 'bs-overviewName' }, h('span', null, title),
									backend.defaultModel ? h('span', { className: 'bs-hint bs-mono' }, backend.defaultModel) : null),
								h('span', { className: 'bs-badge', 'data-active': backend.enabled && scopeActive }, h('span', { className: 'bs-dot', 'data-active': backend.enabled && scopeActive, 'aria-hidden': true }),
									translate(!backend.enabled ? 'inactive' : !scopeActive ? 'scopeInactive' : 'configured')), h(Chevron));
						}))),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('h3', { className: 'bs-title' }, translate('scopeTitle'))),
						h(SwitchRow, { id: 'bs-scope-eng', label: translate('scopeEng'), hint: translate('scopeEngHint'), checked: live.subagents.eng,
							disabled: !writable || busy, onChange: (eng) => edit((current) => ({ ...current, subagents: { ...current.subagents, eng } })) }),
						h(SwitchRow, { id: 'bs-scope-global', label: translate('scopeGlobal'), hint: translate('scopeGlobalHint'), checked: live.subagents.global,
							disabled: !writable || busy, onChange: (global) => edit((current) => ({ ...current, subagents: { ...current.subagents, global } })) }),
						!scopeActive ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('scopeNone'))
							: live.subagents.global ? h('p', { className: 'bs-hint' }, translate('globalOverrides')) : null),
					h('section', { className: 'bs-section' },
						h('h3', { className: 'bs-title' }, translate('behaviorTitle')), h(SwitchRow, { id: 'bs-child-exit-guard', label: translate('childExitGuardLabel'), hint: translate('childExitGuardHint'),
						checked: live.childExitGuard, disabled: !writable || busy, onChange: (childExitGuard) => edit((current) => ({ ...current, childExitGuard })) }))),
				h('div', panelProps('cli'),
					h(Tabs, { id: 'bs-backend', label: translate('tabCli'), compact: true, value: backendTab, onChange: setBackendTab,
						items: BACKENDS.map((spec) => ({ id: spec.cli, label: spec.cli === 'codex' ? 'Codex' : 'Claude', active: live.subagents[spec.cli].enabled && scopeActive })) }),
					...BACKENDS.map((spec) => h('div', { key: spec.cli, id: 'bs-backend-panel-' + spec.cli, role: 'tabpanel',
						'aria-labelledby': 'bs-backend-tab-' + spec.cli, tabIndex: 0, hidden: backendTab !== spec.cli },
						h(BackendCard, { spec, backend: live.subagents[spec.cli], disabled: !writable || busy, capabilities, discovery,
							discoveryMatches: live.subagents[spec.cli].executable === host.subagents[spec.cli].executable && live.subagents[spec.cli].profile === host.subagents[spec.cli].profile,
							scopeActive, t: translate, generation, onPatch: (patch) => patchBackend(spec, patch), onModelPatch: (index, patch) => patchModel(spec, index, patch),
							onModelAdd: () => addModel(spec), onModelRemove: (index) => removeModel(spec, index), onDiscover: () => discoverModels(spec) })))),
				h('div', panelProps('tiers'),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-heading' }, h('h3', { className: 'bs-title' }, translate('tiersTitle')),
							h('p', { className: 'bs-description' }, translate('tiersIntro'))),
						routesState.status === 'loading' ? h('p', { className: 'bs-hint', role: 'status' }, translate('routesLoading'))
							: allowed === null ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('routesError'))
								: !allowed.enabled || allowed.routes.length === 0 ? h('p', { className: 'bs-note', 'data-tone': 'warn' }, translate('tiersInactive')) : null,
						...TIERS.map((tier) => h(TierRow, { key: tier, tier, value: live.tiers[tier], allowed, disabled: !writable || busy,
							t: translate, onPatch: (patch) => patchTier(tier, patch) })))),
				h('div', panelProps('connection'),
					h('section', { className: 'bs-section' },
						h('div', { className: 'bs-sectionHead' }, h('div', { className: 'bs-heading' }, h('h3', { className: 'bs-title' }, translate('tabConnection')),
								h('p', { className: 'bs-description' }, translate('connectionIntro'))),
							h('button', { type: 'button', id: 'bs-refresh', className: 'bs-button', 'data-variant': 'outline',
								disabled: capabilities.status === 'loading' || routesState.status === 'loading', onClick: () => { capabilities.reload(); routesState.reload(); } }, translate('refresh'))),
						h('div', { className: 'bs-connectionRow' }, h('span', null, translate('connectionMode')), h('span', { className: 'bs-badge', 'data-active': writable }, h('span', { className: 'bs-dot', 'data-active': writable, 'aria-hidden': true }), translate(writable ? 'connectionWritable' : 'connectionReadonly'))),
						...[[translate('capabilitiesLabel'), capabilities], [translate('routesLabel'), routesState]].map(([label, endpoint]) =>
							h('div', { key: label, className: 'bs-connectionRow' }, h('span', null, label), h('span', { className: 'bs-connectionStatus', role: 'status' },
								h('span', { className: 'bs-dot', 'data-active': endpoint.status === 'ready', 'aria-hidden': true }),
								translate(endpoint.status === 'loading' ? 'loading' : endpoint.status === 'ready' ? 'ready' : 'failed'))))),
					h('section', { className: 'bs-section' }, h(Field, { id: 'bs-trusted-hosts', label: translate('trustedHostsLabel'), hint: translate('trustedHostsHint'), showHint: true },
						h(HostList, { key: generation, hosts: live.trustedHosts, disabled: !writable || busy, t: translate,
							onChange: (trustedHosts) => edit((current) => ({ ...current, trustedHosts })) })))),
				h('div', { className: 'bs-footer' }, status,
					h('button', { type: 'button', className: 'bs-button', 'data-variant': 'outline', disabled: busy || !dirty, onClick: reset }, translate('reset')),
					h('button', { type: 'button', className: 'bs-button', 'data-variant': 'primary', disabled: !writable || busy || !dirty || invalid !== null,
						onClick: () => void save() }, busy ? translate('saving') : translate('save'))));
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
