#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, 'src', 'content', 'tools');
const PLACEHOLDER_LOGO = '/logos/placeholder.svg';

const TODAY = new Date().toISOString().slice(0, 10);
const VERSION = '2025-12';

const TOOL_SEEDS = [
  {
    slug: 'claude-code',
    title: 'Claude Code',
    description: '终端优先的 AI 编程 Agent，适合多步任务与仓库级改动。',
    website: 'https://docs.claude.com/en/docs/claude-code',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'usage-based', free: false },
    purchase: { officialUrl: 'https://docs.claude.com/en/docs/claude-code', sources: [{ label: 'Claude Code 文档', url: 'https://docs.claude.com/en/docs/claude-code' }] },
    privacy: { policyUrl: 'https://www.anthropic.com/legal/privacy' },
    keywords: ['Claude Code', 'Anthropic', 'AI 编程', 'Agent', '终端'],
  },
  {
    slug: 'windsurf',
    title: 'Windsurf',
    description: 'AI-first IDE（Codeium 团队），强调多步“Flow”工作流与全局上下文。',
    website: 'https://windsurf.ai',
    productType: ['ide'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: true },
    purchase: { officialUrl: 'https://windsurf.ai', sources: [{ label: 'Windsurf 官网', url: 'https://windsurf.ai' }] },
    privacy: { policyUrl: 'https://codeium.com/privacy-policy' },
    keywords: ['Windsurf', 'Codeium', 'AI IDE', 'Agent'],
  },
  {
    slug: 'codeium',
    title: 'Codeium',
    description: '面向多 IDE 的代码补全与 Chat，覆盖个人到团队的常见使用场景。',
    website: 'https://codeium.com',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'freemium', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://codeium.com/pricing', sources: [{ label: 'Codeium 定价页', url: 'https://codeium.com/pricing' }] },
    privacy: { policyUrl: 'https://codeium.com/privacy-policy' },
    keywords: ['Codeium', '代码补全', 'AI 编程', 'VS Code'],
  },
  {
    slug: 'tabnine',
    title: 'Tabnine',
    description: '老牌 AI 代码补全，强调团队/企业落地与可控部署选项。',
    website: 'https://www.tabnine.com',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://www.tabnine.com/pricing', sources: [{ label: 'Tabnine 定价页', url: 'https://www.tabnine.com/pricing' }] },
    privacy: { policyUrl: 'https://www.tabnine.com/privacy-policy' },
    keywords: ['Tabnine', '代码补全', '企业', 'AI 编程'],
  },
  {
    slug: 'jetbrains-ai-assistant',
    title: 'JetBrains AI Assistant',
    description: 'JetBrains 全家桶内置 AI，适合重度 JetBrains 用户的日常开发。',
    website: 'https://www.jetbrains.com/ai/',
    productType: ['ide-extension'],
    category: ['repo-chat'],
    pricing: { model: 'subscription', free: false, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://www.jetbrains.com/ai/', sources: [{ label: 'JetBrains AI 官方页', url: 'https://www.jetbrains.com/ai/' }] },
    privacy: { policyUrl: 'https://www.jetbrains.com/legal/docs/privacy/privacy/' },
    keywords: ['JetBrains', 'AI Assistant', 'IDE', 'Kotlin', 'Java'],
  },
  {
    slug: 'amazon-q-developer',
    title: 'Amazon Q Developer',
    description: 'AWS 生态的开发助手，覆盖代码生成、迁移与安全扫描等场景。',
    website: 'https://aws.amazon.com/q/developer/',
    productType: ['web-app'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://aws.amazon.com/q/developer/pricing/', sources: [{ label: 'Amazon Q Developer Pricing', url: 'https://aws.amazon.com/q/developer/pricing/' }] },
    privacy: { policyUrl: 'https://aws.amazon.com/privacy/' },
    keywords: ['Amazon Q', 'AWS', 'AI 编程', '迁移', '安全'],
  },
  {
    slug: 'gemini-code-assist',
    title: 'Gemini Code Assist',
    description: 'Google 面向开发者的编程助手（IDE + 云端），适合 Gemini 生态用户。',
    website: 'https://cloud.google.com/products/gemini/code-assist',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://cloud.google.com/products/gemini/code-assist', sources: [{ label: 'Gemini Code Assist 官方页', url: 'https://cloud.google.com/products/gemini/code-assist' }] },
    privacy: { policyUrl: 'https://policies.google.com/privacy' },
    keywords: ['Gemini Code Assist', 'Google', '代码补全', 'AI 编程'],
  },
  {
    slug: 'sourcegraph-cody',
    title: 'Cody (Sourcegraph)',
    description: '结合代码搜索与仓库上下文的编程助手，适合大仓库理解与改动。',
    website: 'https://sourcegraph.com/cody',
    productType: ['ide-extension'],
    category: ['repo-chat'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://sourcegraph.com/pricing', sources: [{ label: 'Sourcegraph Pricing', url: 'https://sourcegraph.com/pricing' }] },
    privacy: { policyUrl: 'https://sourcegraph.com/privacy' },
    keywords: ['Cody', 'Sourcegraph', 'Repo Chat', 'AI 编程'],
  },
  {
    slug: 'replit-ai',
    title: 'Replit AI',
    description: '浏览器内的 AI 编程与部署体验，适合快速原型与在线协作。',
    website: 'https://replit.com/ai',
    productType: ['web-app'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: true, hasTeam: true, supportsInvoice: true },
    purchase: { officialUrl: 'https://replit.com/pricing', sources: [{ label: 'Replit Pricing', url: 'https://replit.com/pricing' }] },
    privacy: { policyUrl: 'https://replit.com/site/privacy' },
    keywords: ['Replit', 'Ghostwriter', 'AI 编程', '在线 IDE'],
  },
  {
    slug: 'continue',
    title: 'Continue',
    description: '开源的 IDE Copilot/Agent 框架，可自选模型并接入团队能力。',
    website: 'https://continue.dev',
    productType: ['ide-extension'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: { officialUrl: 'https://continue.dev', sources: [{ label: 'Continue 官网', url: 'https://continue.dev' }] },
    privacy: { policyUrl: 'https://continue.dev/privacy' },
    keywords: ['Continue', '开源', 'VS Code', 'Agent', 'AI 编程'],
  },
  {
    slug: 'aider',
    title: 'Aider',
    description: '面向仓库的 CLI 编程助手：以 git diff 为中心，适合小步改动与重构。',
    website: 'https://github.com/paul-gauthier/aider',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: { officialUrl: 'https://github.com/paul-gauthier/aider', sources: [{ label: 'Aider GitHub', url: 'https://github.com/paul-gauthier/aider' }] },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['Aider', 'CLI', 'git', 'AI 编程', '开源'],
  },
  {
    slug: 'cline',
    title: 'Cline',
    description: 'VS Code 的 Agent 插件，强调“可控执行 + 透明步骤”的任务闭环。',
    website: 'https://github.com/cline/cline',
    productType: ['ide-extension'],
    category: ['agent-coding'],
    pricing: { model: 'usage-based', free: false },
    purchase: { officialUrl: 'https://github.com/cline/cline', sources: [{ label: 'Cline GitHub', url: 'https://github.com/cline/cline' }] },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['Cline', 'VS Code', 'Agent', 'AI 编程'],
  },
  {
    slug: 'roo-code',
    title: 'Roo Code',
    description: 'VS Code 的 Agent 工作流插件（Cline 系生态），适合多步任务与工具集成。',
    website: 'https://github.com/RooVetGit/Roo-Code',
    productType: ['ide-extension'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: { officialUrl: 'https://github.com/RooVetGit/Roo-Code', sources: [{ label: 'Roo Code GitHub', url: 'https://github.com/RooVetGit/Roo-Code' }] },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['Roo Code', 'VS Code', 'Agent', '开源'],
  },
  {
    slug: 'tabby',
    title: 'Tabby',
    description: '开源可自托管的代码补全/聊天服务，适合强调可控与内网部署的团队。',
    website: 'https://tabby.tabbyml.com',
    productType: ['web-app'],
    category: ['code-completion'],
    pricing: { model: 'free', free: true, hasEnterprise: true, supportsContract: true },
    purchase: { officialUrl: 'https://tabby.tabbyml.com', sources: [{ label: 'Tabby 官网', url: 'https://tabby.tabbyml.com' }] },
    privacy: { dataRetention: '由部署方决定', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['Tabby', '自托管', '代码补全', '开源'],
  },
  {
    slug: 'devin',
    title: 'Devin',
    description: '端到端的“软件工程师”式 Agent，强调从任务到交付的闭环。',
    website: 'https://www.cognition-labs.com/devin',
    productType: ['web-app'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: false, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://www.cognition-labs.com/devin', sources: [{ label: 'Devin 官方页', url: 'https://www.cognition-labs.com/devin' }] },
    privacy: { policyUrl: 'https://www.cognition-labs.com/privacy' },
    keywords: ['Devin', 'Agent', 'AI 编程', 'Autonomous'],
  },
  {
    slug: 'openhands',
    title: 'OpenHands',
    description: '开源的 Agent 编程框架/产品，强调可扩展与任务执行。',
    website: 'https://github.com/All-Hands-AI/OpenHands',
    productType: ['web-app'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: { officialUrl: 'https://github.com/All-Hands-AI/OpenHands', sources: [{ label: 'OpenHands GitHub', url: 'https://github.com/All-Hands-AI/OpenHands' }] },
    privacy: { dataRetention: '由部署方决定', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['OpenHands', '开源', 'Agent', 'AI 编程'],
  },
  {
    slug: 'swe-agent',
    title: 'SWE-agent',
    description: '面向软件工程任务的开源 Agent（研究/工程结合），适合基准与实验。',
    website: 'https://github.com/princeton-nlp/SWE-agent',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: { officialUrl: 'https://github.com/princeton-nlp/SWE-agent', sources: [{ label: 'SWE-agent GitHub', url: 'https://github.com/princeton-nlp/SWE-agent' }] },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['SWE-agent', '开源', 'Agent', '研究', 'AI 编程'],
  },
  {
    slug: 'codium-pr-agent',
    title: 'PR-Agent (Qodo)',
    description: '开源 PR Review/自动化 Agent（原 Codium AI），适合团队提质提效。',
    website: 'https://github.com/Codium-ai/pr-agent',
    productType: ['cli'],
    category: ['code-review'],
    pricing: { model: 'free', free: true, hasTeam: true, hasEnterprise: true },
    purchase: { officialUrl: 'https://github.com/Codium-ai/pr-agent', sources: [{ label: 'PR-Agent GitHub', url: 'https://github.com/Codium-ai/pr-agent' }] },
    privacy: { dataRetention: '取决于部署方式与模型服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['PR-Agent', 'Codium', 'Qodo', 'PR Review', '开源'],
  },
  {
    slug: 'coderabbit',
    title: 'CodeRabbit',
    description: 'PR Review 机器人：针对改动给出建议、风险点与可执行反馈。',
    website: 'https://coderabbit.ai',
    productType: ['web-app'],
    category: ['code-review'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://coderabbit.ai', sources: [{ label: 'CodeRabbit 官网', url: 'https://coderabbit.ai' }] },
    privacy: { policyUrl: 'https://coderabbit.ai/privacy' },
    keywords: ['CodeRabbit', 'PR Review', 'AI 审查', '代码评审'],
  },
  {
    slug: 'sweep',
    title: 'Sweep',
    description: 'Issue/需求到 PR 的自动化 Agent，适合“把小需求做完”的场景。',
    website: 'https://sweep.dev',
    productType: ['web-app'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true },
    purchase: { officialUrl: 'https://sweep.dev', sources: [{ label: 'Sweep 官网', url: 'https://sweep.dev' }] },
    privacy: { policyUrl: 'https://sweep.dev/privacy' },
    keywords: ['Sweep', 'Issue to PR', 'Agent', 'AI 编程'],
  },
  {
    slug: 'greptile',
    title: 'Greptile',
    description: '面向仓库的代码理解/问答与 PR 相关辅助，适合大仓库导航。',
    website: 'https://greptile.com',
    productType: ['web-app'],
    category: ['repo-chat'],
    pricing: { model: 'subscription', free: true, hasTeam: true, hasEnterprise: true },
    purchase: { officialUrl: 'https://greptile.com', sources: [{ label: 'Greptile 官网', url: 'https://greptile.com' }] },
    privacy: { policyUrl: 'https://greptile.com/privacy' },
    keywords: ['Greptile', 'Repo Chat', '代码搜索', 'AI 编程'],
  },
  {
    slug: 'phind',
    title: 'Phind',
    description: '面向开发者的搜索/问答体验，偏“搜索 + 代码答案”路线。',
    website: 'https://www.phind.com',
    productType: ['web-app'],
    category: ['repo-chat'],
    pricing: { model: 'freemium', free: true },
    purchase: { officialUrl: 'https://www.phind.com', sources: [{ label: 'Phind 官网', url: 'https://www.phind.com' }] },
    privacy: { policyUrl: 'https://www.phind.com/privacy' },
    keywords: ['Phind', '开发者搜索', 'AI', '代码'],
  },
  {
    slug: 'bito-ai',
    title: 'Bito AI',
    description: 'IDE/团队向的 AI 助手，覆盖代码解释、生成、文档等常见需求。',
    website: 'https://bito.ai',
    productType: ['ide-extension'],
    category: ['repo-chat'],
    pricing: { model: 'subscription', free: true, hasTeam: true, supportsInvoice: true },
    purchase: { officialUrl: 'https://bito.ai/pricing', sources: [{ label: 'Bito Pricing', url: 'https://bito.ai/pricing' }] },
    privacy: { policyUrl: 'https://bito.ai/privacy-policy' },
    keywords: ['Bito', 'AI 编程', 'IDE', '团队'],
  },
  {
    slug: 'pieces',
    title: 'Pieces for Developers',
    description: '开发者知识库/片段管理 + AI 辅助，适合整理与复用常用代码/上下文。',
    website: 'https://pieces.app',
    productType: ['web-app'],
    category: ['doc-generation'],
    pricing: { model: 'freemium', free: true, hasTeam: true },
    purchase: { officialUrl: 'https://pieces.app', sources: [{ label: 'Pieces 官网', url: 'https://pieces.app' }] },
    privacy: { policyUrl: 'https://pieces.app/privacy' },
    keywords: ['Pieces', '知识库', '代码片段', 'AI'],
  },
  {
    slug: 'sourcery',
    title: 'Sourcery',
    description: '自动重构与代码改进建议，适合日常“变得更干净”的小步优化。',
    website: 'https://sourcery.ai',
    productType: ['ide-extension'],
    category: ['code-review'],
    pricing: { model: 'freemium', free: true, hasTeam: true },
    purchase: { officialUrl: 'https://sourcery.ai', sources: [{ label: 'Sourcery 官网', url: 'https://sourcery.ai' }] },
    privacy: { policyUrl: 'https://sourcery.ai/privacy' },
    keywords: ['Sourcery', '重构', '代码质量', 'AI'],
  },
  {
    slug: 'refact-ai',
    title: 'Refact.ai',
    description: '代码补全/聊天与团队能力，主打可控与本地化/自托管选项。',
    website: 'https://refact.ai',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'freemium', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://refact.ai', sources: [{ label: 'Refact.ai 官网', url: 'https://refact.ai' }] },
    privacy: { policyUrl: 'https://refact.ai/privacy' },
    keywords: ['Refact.ai', '代码补全', '自托管', 'AI'],
  },
  {
    slug: 'marscode',
    title: 'MarsCode',
    description: '字节系 AI 编程产品（IDE/插件），偏中文生态与快速上手。',
    website: 'https://www.marscode.com',
    productType: ['ide'],
    category: ['agent-coding'],
    pricing: { model: 'freemium', free: true, hasTeam: true, supportsInvoice: true },
    purchase: { officialUrl: 'https://www.marscode.com', sources: [{ label: 'MarsCode 官网', url: 'https://www.marscode.com' }] },
    privacy: { dataRetention: '以官方政策为准', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['MarsCode', 'AI IDE', '中文', '字节'],
  },
  {
    slug: 'tongyi-lingma',
    title: '通义灵码',
    description: '阿里系 AI 编程助手（IDE 插件/产品），适合国内团队与采购流程。',
    website: 'https://lingma.aliyun.com',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'freemium', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://lingma.aliyun.com', sources: [{ label: '通义灵码官网', url: 'https://lingma.aliyun.com' }] },
    privacy: { dataRetention: '以官方政策为准', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['通义灵码', '阿里', '代码补全', 'AI 编程'],
  },
  {
    slug: 'baidu-comate',
    title: '百度 Comate',
    description: '百度系 AI 编程助手（IDE/插件），偏企业场景与中文生态。',
    website: 'https://comate.baidu.com',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'freemium', free: true, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: { officialUrl: 'https://comate.baidu.com', sources: [{ label: 'Comate 官网', url: 'https://comate.baidu.com' }] },
    privacy: { dataRetention: '以官方政策为准', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['Comate', '百度', 'AI 编程', '代码补全'],
  },
  {
    slug: 'supermaven',
    title: 'Supermaven',
    description: '低延迟的 AI 代码补全工具，适合追求“输入即响应”的日常编码场景。',
    website: 'https://supermaven.com',
    productType: ['ide-extension'],
    category: ['code-completion'],
    pricing: { model: 'subscription', free: true, hasTeam: true, supportsInvoice: false, supportsContract: false },
    purchase: {
      officialUrl: 'https://supermaven.com/pricing',
      sources: [{ label: 'Supermaven Pricing', url: 'https://supermaven.com/pricing' }],
    },
    privacy: { policyUrl: 'https://supermaven.com/privacy' },
    keywords: ['Supermaven', '代码补全', 'AI 编程', '低延迟'],
  },
  {
    slug: 'trae',
    title: 'Trae',
    description: '面向开发者的 AI IDE，强调端到端任务协作与更强的工作流闭环。',
    website: 'https://www.trae.ai',
    productType: ['ide'],
    category: ['agent-coding'],
    pricing: { model: 'freemium', free: true, hasTeam: true, supportsInvoice: false, supportsContract: false },
    purchase: {
      officialUrl: 'https://www.trae.ai/pricing',
      sources: [{ label: 'Trae Pricing', url: 'https://www.trae.ai/pricing' }],
    },
    privacy: { policyUrl: 'https://www.trae.ai/privacy' },
    keywords: ['Trae', 'AI IDE', 'Agent', 'AI 编程'],
  },
  {
    slug: 'gpt-engineer',
    title: 'GPT Engineer',
    description: '开源的“从需求生成项目”的工程化工具，适合快速生成可运行的代码骨架。',
    website: 'https://github.com/AntonOsika/gpt-engineer',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: {
      officialUrl: 'https://github.com/AntonOsika/gpt-engineer',
      sources: [{ label: 'GPT Engineer GitHub', url: 'https://github.com/AntonOsika/gpt-engineer' }],
    },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['GPT Engineer', '开源', 'CLI', 'Agent', 'AI 编程'],
  },
  {
    slug: 'smol-developer',
    title: 'Smol Developer',
    description: '开源“软件开发者”工作流：从需求到代码生成的轻量方案与范式参考。',
    website: 'https://github.com/smol-ai/developer',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: {
      officialUrl: 'https://github.com/smol-ai/developer',
      sources: [{ label: 'Smol Developer GitHub', url: 'https://github.com/smol-ai/developer' }],
    },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['Smol Developer', 'smol-ai', '开源', 'Agent', 'AI 编程'],
  },
  {
    slug: 'gemini-cli',
    title: 'Gemini CLI',
    description: 'Google 开源的 Gemini 命令行助手，用于终端内的问答与开发辅助工作流。',
    website: 'https://github.com/google-gemini/gemini-cli',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'free', free: true },
    purchase: {
      officialUrl: 'https://github.com/google-gemini/gemini-cli',
      sources: [{ label: 'Gemini CLI GitHub', url: 'https://github.com/google-gemini/gemini-cli' }],
    },
    privacy: { dataRetention: '以官方说明为准', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['Gemini CLI', 'Google', 'CLI', 'AI 编程'],
  },
  {
    slug: 'shell-gpt',
    title: 'ShellGPT',
    description: '开源终端助手：把大模型能力带到 Shell，用于命令生成与解释等场景。',
    website: 'https://github.com/TheR1D/shell_gpt',
    productType: ['cli'],
    category: ['doc-generation'],
    pricing: { model: 'free', free: true },
    purchase: {
      officialUrl: 'https://github.com/TheR1D/shell_gpt',
      sources: [{ label: 'ShellGPT GitHub', url: 'https://github.com/TheR1D/shell_gpt' }],
    },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['ShellGPT', 'CLI', '终端', 'AI', '命令生成'],
  },
  {
    slug: 'aicommits',
    title: 'AICommits',
    description: '用大模型生成 commit message 的开源 CLI 工具，适合规范化提交信息。',
    website: 'https://github.com/Nutlope/aicommits',
    productType: ['cli'],
    category: ['doc-generation'],
    pricing: { model: 'free', free: true },
    purchase: {
      officialUrl: 'https://github.com/Nutlope/aicommits',
      sources: [{ label: 'AICommits GitHub', url: 'https://github.com/Nutlope/aicommits' }],
    },
    privacy: { dataRetention: '取决于你所使用的模型/服务', localProcessing: true, enterpriseCompliance: [] },
    keywords: ['AICommits', 'commit', 'CLI', '开源', 'AI'],
  },
  {
    slug: 'github-copilot-cli',
    title: 'GitHub Copilot CLI',
    description: '把 Copilot 带到终端：生成/解释命令与脚本（以 GitHub 官方文档为准）。',
    website: 'https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: false, hasTeam: true, hasEnterprise: true, supportsInvoice: true, supportsContract: true },
    purchase: {
      officialUrl: 'https://github.com/features/copilot#pricing',
      sources: [
        { label: 'GitHub Copilot Pricing', url: 'https://github.com/features/copilot#pricing' },
        {
          label: 'GitHub Docs: Copilot in the command line',
          url: 'https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line',
        },
      ],
    },
    privacy: { policyUrl: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement' },
    keywords: ['GitHub Copilot CLI', 'gh copilot', '终端', 'AI 编程'],
  },
  {
    slug: 'mentat',
    title: 'Mentat',
    description: '面向仓库改动的 Agent/助手产品，偏“多步改动 + 人类把关”的工作流。',
    website: 'https://mentat.ai',
    productType: ['cli'],
    category: ['agent-coding'],
    pricing: { model: 'subscription', free: true, hasTeam: true },
    purchase: { officialUrl: 'https://mentat.ai', sources: [{ label: 'Mentat 官网', url: 'https://mentat.ai' }] },
    privacy: { dataRetention: '以官方政策为准', localProcessing: false, enterpriseCompliance: [] },
    keywords: ['Mentat', 'Agent', 'CLI', 'AI 编程'],
  },
];

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return { write: args.has('--write'), force: args.has('--force'), dryRun: args.has('--dry-run') };
}

function toYamlScalar(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return JSON.stringify(String(value));
}

function toYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]`;
    return value
      .map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const block = toYaml(item, indent + 1);
          return `${pad}-\n${block}`;
        }
        return `${pad}- ${toYamlScalar(item)}`;
      })
      .join('\n');
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    return entries
      .map(([key, v]) => {
        if (Array.isArray(v)) {
          if (v.length === 0) return `${pad}${key}: []`;
          return `${pad}${key}:\n${toYaml(v, indent + 1)}`;
        }
        if (v && typeof v === 'object') {
          return `${pad}${key}:\n${toYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${toYamlScalar(v)}`;
      })
      .join('\n');
  }

  return `${pad}${toYamlScalar(value)}`;
}

function ensurePlaceholderLogo() {
  const logoPath = path.join(ROOT, 'public', 'logos', 'placeholder.svg');
  if (fs.existsSync(logoPath)) return;
  fs.mkdirSync(path.dirname(logoPath), { recursive: true });
  fs.writeFileSync(
    logoPath,
    [
      '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">',
      '<rect x="8" y="8" width="112" height="112" rx="24" fill="#0f172a"/>',
      '<path d="M38 84V44h52v40H38Z" fill="#111827" stroke="#94a3b8" stroke-width="4"/>',
      '<path d="M44 54h40M44 64h28M44 74h34" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>',
      '</svg>',
      '',
    ].join('\n')
  );
}

function buildToolFrontmatter(seed) {
  const pricingDefaults = {
    model: 'subscription',
    free: false,
    hasEducation: false,
    hasTeam: false,
    hasEnterprise: false,
    supportsInvoice: false,
    supportsContract: false,
  };

  const privacyDefaults = {
    dataRetention: '以官方政策为准',
    localProcessing: false,
    enterpriseCompliance: [],
  };

  return {
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    logo: PLACEHOLDER_LOGO,
    website: seed.website,
    productType: seed.productType ?? ['web-app'],
    category: seed.category ?? ['agent-coding'],
    targetUsers: ['前端', '后端', '全栈'],
    notFor: ['强合规/离线环境且无法接入的团队（需先评估）'],
    capabilities: ['repo-context', 'read-only'],
    useCases: ['日常编码：补全/解释/生成常见样板', '快速验证：用小任务跑通一个闭环'],
    pros: ['上手快', '能显著节省重复劳动'],
    cons: ['复杂任务仍需拆解与验收', '团队落地需要权限/审计与数据策略'],
    onboardingTime: '10-30 分钟',
    dependencies: ['网络可用（按工具策略）', 'Git 基础操作（如涉及仓库改动）'],
    pricing: { ...pricingDefaults, ...(seed.pricing ?? {}) },
    purchase: seed.purchase,
    privacy: { ...privacyDefaults, ...(seed.privacy ?? {}) },
    relatedTools: [],
    relatedTutorials: [],
    relatedCompares: [],
    updatedAt: TODAY,
    version: VERSION,
    keywords: seed.keywords ?? [seed.title, 'AI 编程'],
  };
}

function buildToolBody(seed) {
  return [
    '## 一句话建议',
    '',
    '- 先用“只读/建议模式”跑通一个小任务，再逐步开放写入与执行权限（如适用）。',
    '- 价格/条款以官方为准；团队场景优先走可追溯采购路径。',
    '',
    '## 购买与合规提示',
    '',
    '- 优先官方/授权渠道；企业场景尽量使用可开票/可签合同的路径。',
    '- 对第三方聚合/路由平台：评估审计、数据边界与 SLA。',
    '',
  ].join('\n');
}

function writeToolFile(slug, mdx, { force }) {
  const target = path.join(TOOLS_DIR, `${slug}.mdx`);
  if (!force && fs.existsSync(target)) return { status: 'skipped', file: target };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, mdx);
  return { status: fs.existsSync(target) ? 'written' : 'unknown', file: target };
}

function main() {
  const { write, force, dryRun } = parseArgs(process.argv);
  if (!write && !dryRun) {
    console.log('Usage: node scripts/seed-buy-content.mjs --write [--force]');
    console.log('  --write   generate tool mdx files');
    console.log('  --force   overwrite existing files');
    console.log('  --dry-run print planned files');
    process.exit(0);
  }

  ensurePlaceholderLogo();

  const planned = TOOL_SEEDS.map((seed) => seed.slug);
  if (dryRun) {
    console.log(planned.join('\n'));
    return;
  }

  const results = [];
  for (const seed of TOOL_SEEDS) {
    const fm = buildToolFrontmatter(seed);
    const mdx = ['---', toYaml(fm), '---', '', buildToolBody(seed)].join('\n');
    results.push(writeToolFile(seed.slug, mdx, { force }));
  }

  const written = results.filter((r) => r.status === 'written').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  console.log(`Done. written=${written} skipped=${skipped} total=${results.length}`);
}

main();
