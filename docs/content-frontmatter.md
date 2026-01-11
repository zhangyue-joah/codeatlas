# 内容 Frontmatter 规范

本项目采用 `src/content/**.mdx` 作为内容源，使用 `gray-matter` 解析 frontmatter。核心目标是：**字段统一、可追溯、可扩展**。

## 工具（Tools）

路径：`src/content/tools/<slug>.mdx`

必填字段（建议最小集合）：

- `slug`：URL slug（与文件名一致）
- `title`：工具名
- `description`：一句话说明
- `productType`：产品分类（形态）：如 `ide / ide-extension / cli / web-app`
- `category`：分类数组（枚举）
- `capabilities`：能力数组（枚举）
- `pricing`：价格信息
- `privacy`：数据/合规信息
- `updatedAt`：最后核对日期（ISO 字符串）
- `version`：适用版本（如 `2025-12` 或产品版本号）
- `keywords`：SEO 关键词数组

可选字段：

- `affiliateLink` / `affiliateDisclosure`：推广链接与声明（必须成对出现）
- `seoTitle` / `seoDescription`
- `purchase.updatedAt`：购买/价格信息核对日期（建议填写）
- `purchase.sources[]`：来源与链接（建议填写，满足可追溯）
- `privacy.policyUrl` / `privacy.updatedAt`：隐私策略链接与核对日期（建议填写）
- `externalSystems` / `externalSystemIntegrations`：外部系统集成概览与细节（可选）
- `mcpServers` / `mcpServerExamples`：MCP Server 概览与细节（可选）

## 对比（Compare）

路径：`src/content/compare/<slug>.mdx`

核心要求：必须包含“结论先行（3 类人群）”与“最终建议”。

推荐补充（可选）：

- `riskAnalysis.checklist[]`：风险清单（用于“成本与风险分析”结构化展示）
- `riskAnalysis.complianceNotes[]`：合规提示（渠道/数据策略/审计等）
- `riskAnalysis.updatedAt`：风险信息核对日期（ISO）
- `riskAnalysis.sources[]`：来源链接（可追溯）

## 教程（Tutorials）

路径：`src/content/tutorials/<slug>.mdx`

核心要求：必须符合 SOP 模板：目标、适用工具、步骤、关键技巧、失败修复、验收标准。

教程类型（`type`）建议用来做列表筛选与信息架构（不要在正文里“自创分类”）：

- `getting-started`：入门 SOP（第一次跑通）
- `how-to`：场景实战（围绕具体任务的可复制流程）
- `automation`：自动化 / Agent（命令/脚本/MCP/CI，把闭环固化）
- `team-practice`：团队实践（权限/审计/试点→推广）
- `quality-control`：质量与风险控制（成本/合规/安全/验收护栏）

推荐补充（可选）：

- `safety.checklist[]`：安全与合规检查清单（权限、数据、执行命令等）
- `safety.notes[]`：补充提示
- `safety.updatedAt`：核对日期（ISO）
- `safety.sources[]`：来源链接（可追溯）

## 模板（Templates）

路径：`src/content/templates/<slug>.mdx`

核心要求：必须可一键复制，且说明用途、适用工具、注意事项。
