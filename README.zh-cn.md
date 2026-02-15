# ohmymkt

面向营销执行的 OpenCode 插件工作区。

`ohmymkt` 保留上游引擎骨架，但把 Agent 拓扑、ultrawork 路由和运行时工具改造成营销体系。

---

## 核心架构

- 主 Agent：`growth-manager`
- 规划层：`requirements-analyst` + `plan-reviewer`
- 执行层：`execution-manager`
- 领域专家层：AEO / 内容运营 / 内容写作 / 增长分析 / 研究 / SEO
- 工具层：18 个 `ohmymkt_*` 原生运行时工具
- 状态目录：`.ohmymkt/`

---

## 快速开始

```bash
bun install
bun run typecheck
bun run build
```

关键验证：

```bash
bun test src/features/claude-code-agent-loader/loader.test.ts
bun test src/tools/ohmymkt/tools.test.ts
bun test src/tools/ohmymkt/contract.test.ts
bun test src/hooks/keyword-detector/ultrawork/source-detector.test.ts
```

在会话中使用：

```text
ulw 为我们的 SaaS 制定 30 天增长内容与 SEO 计划
```

---

## 目录重点

- Agent 定义：`.claude/agents/`
- 技能目录：`.opencode/skills/`
- 营销工具：`src/tools/ohmymkt/`
- 文档入口：`docs/guide/overview.md`

---

## 说明

本仓库的品牌与文档体系统一为 `ohmymkt`，营销拓扑为默认工作方式。
