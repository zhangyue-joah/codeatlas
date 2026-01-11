# Codex 一键填充「产品列表」命令

本仓库的产品列表来自 `src/content/tools/*.mdx`。为了避免手工逐个新增，本项目提供了一个生成器：读取 `scripts/tools.seed.json`，批量生成/更新工具条目。

## 一键执行（推荐）

```bash
npm run fill:tools -- --overwrite && npm run build
```

- `--overwrite`：会更新 `scripts/tools.seed.json` 中对应 `slug` 的条目文件 frontmatter；默认保留正文内容（不会影响未在 seed 里的条目）。
- `--regenerate-body`：配合 `--overwrite` 使用，强制用生成器的默认正文覆盖现有正文（谨慎使用）。

## 只生成缺失条目（不覆盖已有）

```bash
npm run fill:tools && npm run build
```

## 维护清单

- 编辑 `scripts/tools.seed.json`：新增/调整产品信息（`slug` 必须与文件名一致，且只允许小写字母/数字/短横线）。
- 执行生成：`npm run fill:tools -- --overwrite`

## GitHub 覆盖率审计（可选）

基于 GitHub curated list `sourcegraph/awesome-code-ai` 做一次“常见工具覆盖”比对（只输出报告，不改动文件）：

```bash
node scripts/sync-awesome-code-ai.mjs --strict
```

## 说明（合规与信息来源）

- 清单包含：常见 AI 编程产品（IDE/插件/CLI/Agent/PR Review/Repo Chat 等），以“直接产出或改动工程产物”为收录边界。
- 模型渠道/云平台/网关/路由/观测等不收录到 `Tools`；相关内容请放在 `/buy` 与渠道类教程/模板中（如 `src/content/tutorials/llm-api-providers-and-gateways.mdx`）。
- 未收录不明来源、可能违反上游服务条款或用于绕过访问限制的“镜像/非授权中转站点”。如你明确需要“授权渠道/企业采购”类信息，请在 `src/lib/buy/channels.ts` 与相关教程中补可验证来源。
