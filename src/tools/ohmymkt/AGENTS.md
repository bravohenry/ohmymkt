# ohmymkt/
> L2 | 父级: /Users/henry/PARA/[01] Projects/Vibe/ohmymkt/oh-my-opencode-fork/src/tools/AGENTS.md

成员清单
index.ts: `createOhmymktTools()` 聚合入口，输出 18 个 `ohmymkt_*` 工具
config.ts: 运行时配置解析（`projectRoot=ctx.directory` + provider 加载）
runtime/constants.ts: `.ohmymkt/` 路径与模板路径定义
runtime/io.ts: 文件读写/目录创建/时间与字符串工具
runtime/roles.ts: 规划/评审/执行角色目录
runtime/plans.ts: 计划创建/解析/列表
runtime/gates.ts: 启动门禁评估与报告
runtime/campaign.ts: 启动 campaign 与执行状态初始化
runtime/cycle.ts: 周期运行与 continue/intervene/rollback 决策
runtime/incidents.ts: P0/P1/P2 事故记录与统计
runtime/reports.ts: 增长汇总报告生成
runtime/research.ts: research brief/competitor/positioning/asset manifest
runtime/content-gen.ts: 图片/视频生成适配层
runtime/publish.ts: 平台发布适配层
templates/*.json: gates/metrics/modules/task-pool 模板

工具文件
plan-growth.ts, check-gates.ts, start-campaign.ts, run-cycle.ts, incident.ts, report-growth.ts, list-plans.ts, update-gates.ts, update-metrics.ts, read-state.ts, research-brief.ts, save-positioning.ts, asset-manifest.ts, provider-config.ts, generate-image.ts, generate-video.ts, publish-content.ts, competitor-profile.ts

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
