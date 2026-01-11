/**
 * 筛选配置 - 统一管理各页面筛选项的常量定义
 *
 * 说明：
 * - 将重复定义的筛选常量集中管理，避免不一致
 * - QuickEntry、tools/page、templates/page 等共用这些常量
 */

import type { TTemplateType, TToolCategory } from '@/types';

/**
 * AI 编程工作流分类 - 用于 /tools 页面筛选和 QuickEntry 快捷入口
 */
export const AI_CODING_WORKFLOWS: TToolCategory[] = [
  'code-completion',
  'agent-coding',
  'code-review',
  'testing',
  'repo-chat',
  'doc-generation',
  'devops',
];

/**
 * 模板类型 - 用于 /templates 页面筛选和 QuickEntry 快捷入口
 */
export const TEMPLATE_TYPES: TTemplateType[] = [
  'mcp-config',
  'prompt-recipe',
  'agent-instruction',
  'skill',
];

/**
 * 检查值是否为有效的工作流分类
 */
export function isToolWorkflowCategory(value: string): value is TToolCategory {
  return AI_CODING_WORKFLOWS.includes(value as TToolCategory);
}

/**
 * 检查值是否为有效的模板类型
 */
export function isTemplateType(value: string): value is TTemplateType {
  return TEMPLATE_TYPES.includes(value as TTemplateType);
}
