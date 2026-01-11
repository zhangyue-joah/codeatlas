import type { TLanguage } from '@/types';

export const ROLE_DEFINITIONS = [
  { id: 'frontend', labelZh: '前端', labelEn: 'Frontend' },
  { id: 'backend', labelZh: '后端', labelEn: 'Backend' },
  { id: 'fullstack', labelZh: '全栈', labelEn: 'Full-stack' },
  { id: 'data', labelZh: '数据', labelEn: 'Data' },
] as const;

export type TRoleId = (typeof ROLE_DEFINITIONS)[number]['id'];

export function isRoleId(value: string): value is TRoleId {
  return ROLE_DEFINITIONS.some((item) => item.id === value);
}

export function getRoleEntries(language: TLanguage): [TRoleId, string][] {
  return ROLE_DEFINITIONS.map((item) => [item.id, language === 'en' ? item.labelEn : item.labelZh]);
}

export function getRoleLabel(language: TLanguage, roleId: string): string | undefined {
  const role = ROLE_DEFINITIONS.find((item) => item.id === roleId);
  if (!role) return undefined;
  return language === 'en' ? role.labelEn : role.labelZh;
}

/**
 * 过滤用的角色匹配：兼容历史数据（frontmatter.targetUsers 目前为中文标签）。
 */
export function matchesRole(targetUsers: string[], roleId: string): boolean {
  const role = ROLE_DEFINITIONS.find((item) => item.id === roleId);
  if (!role) return false;
  return targetUsers.includes(role.labelZh) || targetUsers.includes(role.labelEn);
}
