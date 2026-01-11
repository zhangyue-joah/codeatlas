# Codex 一键填充「规则与配置」页面（/templates）

目标：让 Codex 自动补齐 `src/content/templates` 下的模板内容，覆盖常见 AI 编程产品与官方/合规第三方（含自建网关）接入方式，并确保：

- 不拷贝大段第三方文章/仓库文档（只做自写整理 + 给出处链接）
- 不提供账号共享、代充、绕价、不可追溯 key 等灰色方案
- 通过构建期 frontmatter 校验（slug/updatedAt/template/keywords 等）

## 一条命令（推荐）

在仓库根目录执行：

```bash
codex exec --full-auto --skip-git-repo-check -m gpt-5.2 -C . -o .codex_last_message.txt - <<'PROMPT'
你在 CodeAtlas（Next.js）仓库中工作。请一次性完成「规则与配置（/templates）」内容填充与校验：

约束与目标
1) 只在 src/content/templates 下新增/更新 .mdx 文件；不要改动无关页面/样式。
2) 每个模板必须满足 src/types/template.ts 的 frontmatter 字段，且能通过 src/services/frontmatterValidation.ts 的校验。
3) 内容必须是“你自己整理写出来的”，禁止从 GitHub/知乎/博客复制大段文字；可以引用链接作为来源。
4) 必须覆盖“市面常见 AI 编程产品”（IDE/插件/CLI/PR 自动化/Web 生成等）与“官方/合规第三方提供方/聚合/自建网关（中转）”。
5) 合规底线：不得建议账号共享、代充、绕价、不可追溯 key、中高风险灰色中转；若遇到此类内容，明确写“不收录/不建议”。

执行步骤（按顺序做）
A. 快速扫描：阅读 README.md 里 Templates 相关约束；阅读现有模板样例 src/content/templates/*.mdx。
B. 补齐模板集合（优先新增，不要大改现有标题/slug）：
   - agent-instruction：通用 Agent 行为准则 +（至少）Cursor / Copilot 的仓库/项目指令示例
   - mcp-config：MCP（GitHub / filesystem）示例配置 +（至少）一个主流客户端（如 Claude Desktop）的 mcpServers 配置示例
   - prompt-recipe：产品清单（按任务分类）+ 提供方/中转/聚合/网关清单（官方/授权/自建），并给出“接入确认清单”的可复制 prompt
   - （可选）pr-review-rule：如果缺少更严格版本的 PR review 规则，可补一份
C. 为每个清单项给出“最少一个权威链接来源”：
   - 官方产品：官网/官方文档
   - 开源产品：GitHub repo
   - 提供方/聚合：官方 docs
   - 自建网关：官方 docs + repo（如适用）
D. 更新每个模板的 updatedAt（ISO 日期），keywords（数组，含中英文关键字），notes（注意事项，至少 2 条）。
E. 运行 npm run build，修复任何 frontmatter 校验、MDX 渲染或 TypeScript 错误，直到构建通过。

完成后输出
1) 你新增/更新了哪些模板（slug 列表）
2) 你覆盖了哪些产品与提供方类别（简要分类）
3) 构建是否通过（贴出你运行的命令与结果摘要）
PROMPT
```

## 只做验证（可选）

```bash
npm run build
```
