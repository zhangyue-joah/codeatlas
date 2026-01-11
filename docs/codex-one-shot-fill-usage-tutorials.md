# Codex 一键填充“实操教程”内容（可复制执行）

> 说明：下面是一条可直接执行的命令，会让 Codex 以**非交互**方式补齐 `src/content/tutorials/` 的教程内容，并运行一次构建验证。  
> 你只需要复制整段命令执行一次即可，无需重复输入多条指令。

```sh
codex exec --full-auto -C . - <<'PROMPT'
你在一个 Next.js 内容站点仓库（CodeAtlas）里工作。请一次性把“实操教程”页面的内容填充完善，要求：

目标
- 让 /tutorials 页面不再稀疏：新增多个教程条目（MDX），覆盖市面上常见 AI 编程产品，并补齐一篇“模型/API 渠道（官方/云平台/第三方聚合与自托管）”教程。
- 内容必须是你自己组织的总结，禁止从 GitHub/知乎/博客直接复制粘贴长段文字（避免版权问题）；可以联网检索以核对产品名称、官网链接与分类，但写作需原创表述。

具体交付
1) 在 src/content/tutorials/ 下新增（如已存在则校对/补齐）以下教程文件（slug 必须与文件名一致，且满足 frontmatter 校验与页面渲染需要）：
   - ai-coding-product-map.mdx（产品地图：常见产品清单 + 选型 SOP，含大量官方/开源入口链接）
   - llm-api-providers-and-gateways.mdx（LLM 接口渠道：官方/云平台/第三方聚合〔常被称为中转〕/自托管，含常见入口链接与合规/成本检查清单）
   - cursor-getting-started.mdx（已存在则保持；确保格式符合 SOP）
   - github-copilot-getting-started.mdx
   - jetbrains-ai-assistant-getting-started.mdx
   - continue-vscode-getting-started.mdx
   - cline-vscode-getting-started.mdx
   - aider-cli-getting-started.mdx
   - amazon-q-developer-getting-started.mdx
   - gemini-code-assist-getting-started.mdx
   - replit-agent-getting-started.mdx
   - windsurf-getting-started.mdx
   - tabby-self-hosted-getting-started.mdx

2) 教程 frontmatter 必须包含并合理填写（参考现有 cursor-getting-started.mdx 的结构）：
   slug/title/description/type/difficulty/goal/requiredTools/requiredCapabilities/estimatedTime/stepsOverview/steps/keyTips/commonFailures/acceptanceCriteria/relatedTools/relatedTemplates/updatedAt/keywords
   - updatedAt 用可解析的 ISO 日期字符串（如 2025-12-28）
   - requiredCapabilities 只使用项目枚举（repo-context/agent-execution/mcp-server/skills-plugins/local-command/external-system/read-only/read-write/execute）

3) “产品地图”教程必须覆盖（至少提及并给出入口链接）这些常见类别与代表产品（可扩充但不要遗漏主流）：
   - Agentic IDE/编辑器：Cursor、Windsurf、VS Code、JetBrains、Zed
   - IDE 插件/助手：GitHub Copilot、JetBrains AI Assistant、Amazon Q Developer、Gemini Code Assist、Codeium、Tabnine、Sourcegraph Cody
   - VS Code Agent/开源：Continue、Cline、Roo Code、avante.nvim
   - CLI/Agent：Aider、OpenHands、SWE-agent、Sweep
   - App Builder：Bolt.new、v0、Lovable、Replit
   - 其他常见：Supermaven、Phind、Blackbox、CodeRabbit、Devin、ChatGPT、Claude、Gemini

4) “LLM 接口渠道”教程必须包含：
   - 官方/云平台入口链接：OpenAI、Azure OpenAI、Anthropic、Google AI Studio、Vertex AI、AWS Bedrock、Mistral、Cohere、xAI、DeepSeek
   - 国内常见官方入口（按政策与 ToS 使用）：DashScope（通义）、智谱 BigModel、百度千帆、腾讯混元、Moonshot（Kimi）
   - 第三方聚合/托管推理入口链接：OpenRouter、Together.ai、Fireworks.ai、GroqCloud、Replicate、Hugging Face Inference、Cloudflare Workers AI、DeepInfra、Anyscale Endpoints
   - 网关/可观测（可选但建议）：LiteLLM、Helicone、Portkey、Langfuse
   - 强调合规与风险：避免不明来源共享 Key/代充/绕过渠道；提供“选择检查清单（合规/隐私/可追溯/稳定性/成本控制）”

5) 同步更新 src/content/tools/github-copilot.mdx：
   - 将 relatedTutorials 设为包含 github-copilot-getting-started

验证
- 运行 npm run build 确保通过（frontmatter 校验会在构建期触发）。
- 只修复与你新增/修改内容相关的错误，不要大范围重构。

输出
- 完成后用简短总结说明新增了哪些教程文件、以及 build 是否通过。
PROMPT
```
