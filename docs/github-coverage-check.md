# GitHub 检索覆盖核对：AI 编程产品与渠道

本仓库的“常见产品清单”参考了以下 GitHub 清单做交叉核对（仅用于核对名称与入口，不复制原文内容）：

- https://github.com/ai-for-developers/awesome-ai-coding-tools
- https://github.com/filipecalegario/awesome-vibe-coding
- https://github.com/sourcegraph/awesome-code-ai
- https://github.com/wsxiaoys/awesome-ai-coding

## 我们站点里对应的位置

- “实操教程（产品地图）”：`src/content/tutorials/ai-coding-product-map.mdx`
- “LLM 渠道（官方/云平台/第三方聚合/自托管）”：`src/content/tutorials/llm-api-providers-and-gateways.mdx`
- “产品详情页（信息更全）”：`src/content/tools/*.mdx`（每个产品都有结构化字段：形态、能力、场景、优缺点、价格与隐私等）

## 主流产品快速对照（示例）

（入口以站内 `tools/<slug>` 为准，教程以 `tutorials/<slug>` 为准）

- Cursor：`/tools/cursor` · `/tutorials/cursor-getting-started`
- GitHub Copilot：`/tools/github-copilot` · `/tutorials/github-copilot-getting-started`
- Windsurf：`/tools/windsurf` · `/tutorials/windsurf-getting-started`
- Codeium：`/tools/codeium`
- Tabnine：`/tools/tabnine`
- Continue：`/tools/continue` · `/tutorials/continue-vscode-getting-started`
- Cline：`/tools/cline` · `/tutorials/cline-vscode-getting-started`
- Roo Code：`/tools/roo-code`
- Aider：`/tools/aider` · `/tutorials/aider-cli-getting-started`
- OpenHands：`/tools/openhands`
- SWE-agent：`/tools/swe-agent`
- Sweep：`/tools/sweep`
- Bolt.new：`/tools/bolt-new`
- v0：`/tools/vercel-v0`
- Lovable：`/tools/lovable`
- Replit AI：`/tools/replit-ai` · `/tutorials/replit-agent-getting-started`
- Sourcegraph Cody：`/tools/sourcegraph-cody`
- JetBrains AI Assistant：`/tools/jetbrains-ai-assistant` · `/tutorials/jetbrains-ai-assistant-getting-started`
- Amazon Q Developer：`/tools/amazon-q-developer` · `/tutorials/amazon-q-developer-getting-started`
- Gemini Code Assist：`/tools/gemini-code-assist` · `/tutorials/gemini-code-assist-getting-started`
- Supermaven：`/tools/supermaven`
- Blackbox AI：`/tools/blackbox-ai`

## 渠道/网关（示例）

说明：渠道/网关属于“模型接入与采购路径”，不属于 `Tools` 的“AI 编程产品”收录范围；站内通过教程/模板与 `/buy` 页面集中呈现与维护。

- 入口/清单：`src/content/tutorials/llm-api-providers-and-gateways.mdx`
- 站内采购渠道数据：`src/lib/buy/channels.ts`
- 页面：`/buy`
