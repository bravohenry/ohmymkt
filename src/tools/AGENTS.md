# tools/
> L2 | 父级: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/ohmymkt/AGENTS.md

成员清单（核心）
delegate-task/: 任务委派与类别路由
task/: task_create/list/get/update 工具集
skill/: 技能执行工具
skill-mcp/: 技能 MCP 交互工具
slashcommand/: slash command 发现与执行
ohmymkt/: 营销工具命名空间（18 个 `ohmymkt_*` 工具 + runtime + templates）

注册链
所有工具统一由 `src/plugin/tool-registry.ts` 聚合并经过 `filterDisabledTools` 过滤；`ohmymkt_*` 与 OMO 原生工具同级可控。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
