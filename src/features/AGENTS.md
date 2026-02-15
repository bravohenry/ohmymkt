# features/
> L2 | 父级: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/oh-my-opencode-fork/AGENTS.md

成员清单（本次相关）
claude-code-agent-loader/loader.ts: 项目/用户 Agent 装载；支持 `mode/model/temperature/tools` frontmatter 扩展
claude-code-agent-loader/types.ts: Agent frontmatter 类型定义（含 `tools: string | string[]`）
claude-code-plugin-loader/agent-loader.ts: 插件 Agent 装载；与主 loader 保持同样 tools 解析策略

关键约束
Agent markdown 发现统一依赖 `src/shared/file-utils.ts:isMarkdownFile()`：
- 仅加载 `*.md`
- 显式排除 `AGENTS.md`、`README.md`
- 彻底避免文档文件被误注入为伪 Agent

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
