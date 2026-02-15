# ohmymkt/
> L2 | 父级: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/AGENTS.md

目录结构
.claude/agents/ - 项目级营销 Agent 拓扑（主 Agent + 规划层 + 执行层 + 领域层）
.opencode/skills/ - 项目级营销技能集合（由 OMO skill-loader 原生加载）
.opencode/ohmymkt.json - 运行配置（`default_run_agent=growth-manager`，禁用非营销 Agent）
src/tools/ohmymkt/ - OMO 原生营销工具命名空间（18 个 `ohmymkt_*` 工具 + runtime + templates）
src/hooks/keyword-detector/ultrawork/ - ultrawork 注入路由（新增 marketing 分支）
src/features/ - 上游主干功能模块（保留 OMO 原骨架）

架构决策
营销化改造坚持“保留 OMO 主骨架 + 走原生扩展点”：
1. Agent 仍由 `.claude/agents` 装载（含 `mode/model/temperature/tools` frontmatter）
2. 营销能力通过 `src/tools/ohmymkt/` 注册进 `tool-registry`，不旁路 OMO
3. ultrawork 通过 source-detector 新增 `marketing` 路由，避免注入已禁用 Agent

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
