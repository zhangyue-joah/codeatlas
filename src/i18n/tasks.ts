import type { TLanguage } from '@/types';

export const TUTORIAL_TASK_DEFINITIONS = [
  { id: 'write', keywordZh: '写功能', keywordEn: 'Build features', labelZh: '写功能', labelEn: 'Build features' },
  { id: 'fix', keywordZh: '改 Bug', keywordEn: 'Fix bugs', labelZh: '改 Bug', labelEn: 'Fix bugs' },
  { id: 'test', keywordZh: '补测试', keywordEn: 'Add tests', labelZh: '补测试', labelEn: 'Add tests' },
  { id: 'review', keywordZh: 'PR Review', keywordEn: 'PR Review', labelZh: '代码评审', labelEn: 'Code review' },
] as const;

export type TTutorialTaskId = (typeof TUTORIAL_TASK_DEFINITIONS)[number]['id'];

export function getTutorialTaskEntries(language: TLanguage): [TTutorialTaskId, string][] {
  return TUTORIAL_TASK_DEFINITIONS.map((item) => [item.id, language === 'en' ? item.labelEn : item.labelZh]);
}

export function getTutorialTaskLabel(language: TLanguage, taskId: string): string | undefined {
  const task = TUTORIAL_TASK_DEFINITIONS.find((item) => item.id === taskId);
  if (!task) return undefined;
  return language === 'en' ? task.labelEn : task.labelZh;
}

export function getTutorialTaskKeyword(taskId: string): string | undefined {
  return TUTORIAL_TASK_DEFINITIONS.find((item) => item.id === taskId)?.keywordZh;
}

/**
 * 过滤用的任务匹配：兼容历史数据（frontmatter.keywords 目前以中文为主）。
 */
export function matchesTutorialTask(keywords: string[], taskId: string): boolean {
  const task = TUTORIAL_TASK_DEFINITIONS.find((item) => item.id === taskId);
  if (!task) return false;
  return keywords.includes(task.keywordZh) || keywords.includes(task.keywordEn);
}
