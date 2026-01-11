import type {
  TToolCapability,
  TToolCategory,
  TToolProductType,
  TPricingModel,
  TDifficulty,
  TTutorialType,
  TTemplateType,
  TContentType,
} from '@/types';

export const TOOL_PRODUCT_TYPE_LABEL: Record<TToolProductType, string> = {
  ide: 'IDE / 编辑器',
  'ide-extension': 'IDE 插件',
  cli: 'CLI / 终端',
  'web-app': 'Web 应用',
};

export const TOOL_CATEGORY_LABEL: Record<TToolCategory, string> = {
  'code-completion': '代码补全 / 生成',
  'agent-coding': 'Agent 编程',
  testing: '测试与质量',
  'code-review': '代码审查 / PR Review',
  'repo-chat': 'Repo Chat / 搜索',
  'doc-generation': '文档生成',
  devops: 'DevOps / CI',
};

export const TOOL_CAPABILITY_LABEL: Record<TToolCapability, string> = {
  'repo-context': 'Repo 级上下文',
  'agent-execution': 'Agent 执行',
  'mcp-server': 'MCP Server',
  'skills-plugins': 'Skills / Plugins',
  'local-command': '本地命令',
  'external-system': '外部系统集成',
  'read-only': '只读',
  'read-write': '读写',
  execute: '执行',
};

export const PRICING_MODEL_LABEL: Record<TPricingModel, string> = {
  free: '免费',
  freemium: '免费增值',
  subscription: '订阅制',
  'usage-based': '按量计费',
  'one-time': '一次性购买',
};

export const TUTORIAL_TYPE_LABEL: Record<TTutorialType, string> = {
  'getting-started': '入门 SOP',
  'how-to': '场景实战',
  automation: '自动化 / Agent',
  'team-practice': '团队实践',
  'quality-control': '质量与风险控制',
};

export const TUTORIAL_DIFFICULTY_LABEL: Record<TDifficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

export const TEMPLATE_TYPE_LABEL: Record<TTemplateType, string> = {
  'agent-instruction': 'Agent 指令',
  'mcp-config': 'MCP 配置',
  'prompt-recipe': '多步 Prompt 配方',
  'skill': 'Claude Skill',
};

export const CONTENT_TYPE_LABEL: Record<TContentType, string> = {
  tools: '产品列表',
  compare: '对比',
  tutorials: '实操教程',
  templates: '模板',
};
