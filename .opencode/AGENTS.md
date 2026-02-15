# .opencode/
> L2 | 父级: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt/AGENTS.md

成员清单
ohmymkt.json: 项目级运行配置，固定营销默认主 Agent 与禁用 Agent 集
skills/: 项目级营销技能目录（引用 `ohmymkt_*` 工具）
command/: 项目级命令模板目录
background-tasks.json: 后台任务状态

对齐说明
`skills/` 与 `.claude/agents/` 中出现的 `ohmymkt_*` 标记，已由 `src/tools/ohmymkt/` 接入 OMO 原生工具注册链（`src/plugin/tool-registry.ts`）。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
