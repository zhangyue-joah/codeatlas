import type {
  TContentType,
  TDifficulty,
  TPricingModel,
  TTemplateType,
  TTutorialType,
  TToolCapability,
  TToolCategory,
  TToolProductType,
  TLanguage,
} from '@/types';

// ============ 中文标签 ============

export const TOOL_PRODUCT_TYPE_LABEL_ZH: Record<TToolProductType, string> = {
  ide: 'IDE / 编辑器',
  'ide-extension': 'IDE 插件',
  cli: '命令行工具',
  'web-app': 'Web 应用',
};

const TOOL_CATEGORY_LABEL_ZH: Record<TToolCategory, string> = {
  'code-completion': '代码补全 / 生成',
  'agent-coding': 'AI 自主编程',
  testing: '测试与质量',
  'code-review': '代码评审',
  'repo-chat': '代码库问答',
  'doc-generation': '文档生成',
  devops: '部署与自动化',
};

export const TOOL_CAPABILITY_LABEL_ZH: Record<TToolCapability, string> = {
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

const PRICING_MODEL_LABEL_ZH: Record<TPricingModel, string> = {
  free: '免费',
  freemium: '免费 + 付费升级',
  subscription: '订阅制',
  'usage-based': '按量计费',
  'one-time': '一次性购买',
};

const TUTORIAL_TYPE_LABEL_ZH: Record<TTutorialType, string> = {
  'getting-started': '入门指南',
  'how-to': '场景实战',
  automation: 'AI 自动化',
  'team-practice': '团队实践',
  'quality-control': '质量与风险控制',
};

const TUTORIAL_DIFFICULTY_LABEL_ZH: Record<TDifficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

const TEMPLATE_TYPE_LABEL_ZH: Record<TTemplateType, string> = {
  'agent-instruction': 'AI 行为规则',
  'mcp-config': '工具连接配置',
  'prompt-recipe': '提示词模板',
  'skill': 'Claude 技能扩展',
};

const CONTENT_TYPE_LABEL_ZH: Record<TContentType, string> = {
  tools: '工具',
  compare: '对比',
  tutorials: '教程',
  templates: '模板',
};

// ============ 英文标签 ============

const TOOL_PRODUCT_TYPE_LABEL_EN: Record<TToolProductType, string> = {
  ide: 'IDE / editor',
  'ide-extension': 'IDE extension',
  cli: 'Command line',
  'web-app': 'Web app',
};

const TOOL_CATEGORY_LABEL_EN: Record<TToolCategory, string> = {
  'code-completion': 'Code completion',
  'agent-coding': 'AI autonomous coding',
  testing: 'Testing & quality',
  'code-review': 'Code review',
  'repo-chat': 'Codebase Q&A',
  'doc-generation': 'Docs generation',
  devops: 'Deploy & automation',
};

const TOOL_CAPABILITY_LABEL_EN: Record<TToolCapability, string> = {
  'repo-context': 'Repo context',
  'agent-execution': 'Agent execution',
  'mcp-server': 'MCP server',
  'skills-plugins': 'Skills / plugins',
  'local-command': 'Local commands',
  'external-system': 'External systems',
  'read-only': 'Read-only',
  'read-write': 'Read & write',
  execute: 'Execute',
};

const PRICING_MODEL_LABEL_EN: Record<TPricingModel, string> = {
  free: 'Free',
  freemium: 'Free + paid upgrade',
  subscription: 'Subscription',
  'usage-based': 'Usage-based',
  'one-time': 'One-time',
};

const TUTORIAL_TYPE_LABEL_EN: Record<TTutorialType, string> = {
  'getting-started': 'Getting started',
  'how-to': 'How-to guide',
  automation: 'AI automation',
  'team-practice': 'Team practice',
  'quality-control': 'Quality & risk control',
};

const TUTORIAL_DIFFICULTY_LABEL_EN: Record<TDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TEMPLATE_TYPE_LABEL_EN: Record<TTemplateType, string> = {
  'agent-instruction': 'AI behavior rules',
  'mcp-config': 'Tool connection',
  'prompt-recipe': 'Prompt templates',
  'skill': 'Claude skills',
};

const CONTENT_TYPE_LABEL_EN: Record<TContentType, string> = {
  tools: 'Tools',
  compare: 'Compare',
  tutorials: 'Tutorials',
  templates: 'Templates',
};

export function getToolCategoryLabel(language: TLanguage, category: TToolCategory): string {
  return language === 'en' ? TOOL_CATEGORY_LABEL_EN[category] : TOOL_CATEGORY_LABEL_ZH[category];
}

export function getToolCapabilityLabel(language: TLanguage, capability: TToolCapability): string {
  return language === 'en' ? TOOL_CAPABILITY_LABEL_EN[capability] : TOOL_CAPABILITY_LABEL_ZH[capability];
}

export function getToolProductTypeLabel(language: TLanguage, type: TToolProductType): string {
  return language === 'en' ? TOOL_PRODUCT_TYPE_LABEL_EN[type] : TOOL_PRODUCT_TYPE_LABEL_ZH[type];
}

export function getPricingModelLabel(language: TLanguage, model: TPricingModel): string {
  return language === 'en' ? PRICING_MODEL_LABEL_EN[model] : PRICING_MODEL_LABEL_ZH[model];
}

export function getTutorialTypeLabel(language: TLanguage, type: TTutorialType): string {
  return language === 'en' ? TUTORIAL_TYPE_LABEL_EN[type] : TUTORIAL_TYPE_LABEL_ZH[type];
}

export function getTutorialDifficultyLabel(language: TLanguage, difficulty: TDifficulty): string {
  return language === 'en' ? TUTORIAL_DIFFICULTY_LABEL_EN[difficulty] : TUTORIAL_DIFFICULTY_LABEL_ZH[difficulty];
}

export function getTemplateTypeLabel(language: TLanguage, type: TTemplateType): string {
  return language === 'en' ? TEMPLATE_TYPE_LABEL_EN[type] : TEMPLATE_TYPE_LABEL_ZH[type];
}

export function getContentTypeLabel(language: TLanguage, type: TContentType): string {
  return language === 'en' ? CONTENT_TYPE_LABEL_EN[type] : CONTENT_TYPE_LABEL_ZH[type];
}

export function getToolCategoryEntries(language: TLanguage): [TToolCategory, string][] {
  const map = language === 'en' ? TOOL_CATEGORY_LABEL_EN : TOOL_CATEGORY_LABEL_ZH;
  return Object.entries(map) as [TToolCategory, string][];
}

export function getToolProductTypeEntries(language: TLanguage): [TToolProductType, string][] {
  const map = language === 'en' ? TOOL_PRODUCT_TYPE_LABEL_EN : TOOL_PRODUCT_TYPE_LABEL_ZH;
  return Object.entries(map) as [TToolProductType, string][];
}

export function getToolCapabilityEntries(language: TLanguage): [TToolCapability, string][] {
  const map = language === 'en' ? TOOL_CAPABILITY_LABEL_EN : TOOL_CAPABILITY_LABEL_ZH;
  return Object.entries(map) as [TToolCapability, string][];
}

export function getPricingModelEntries(language: TLanguage): [TPricingModel, string][] {
  const map = language === 'en' ? PRICING_MODEL_LABEL_EN : PRICING_MODEL_LABEL_ZH;
  return Object.entries(map) as [TPricingModel, string][];
}

export function getTutorialTypeEntries(language: TLanguage): [TTutorialType, string][] {
  const map = language === 'en' ? TUTORIAL_TYPE_LABEL_EN : TUTORIAL_TYPE_LABEL_ZH;
  return Object.entries(map) as [TTutorialType, string][];
}

export function getTutorialDifficultyEntries(language: TLanguage): [TDifficulty, string][] {
  const map = language === 'en' ? TUTORIAL_DIFFICULTY_LABEL_EN : TUTORIAL_DIFFICULTY_LABEL_ZH;
  return Object.entries(map) as [TDifficulty, string][];
}

export function getTemplateTypeEntries(language: TLanguage): [TTemplateType, string][] {
  const map = language === 'en' ? TEMPLATE_TYPE_LABEL_EN : TEMPLATE_TYPE_LABEL_ZH;
  return Object.entries(map) as [TTemplateType, string][];
}

export function getContentTypeEntries(language: TLanguage): [TContentType, string][] {
  const map = language === 'en' ? CONTENT_TYPE_LABEL_EN : CONTENT_TYPE_LABEL_ZH;
  return Object.entries(map) as [TContentType, string][];
}
