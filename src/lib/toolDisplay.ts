import type { IToolFrontmatter, TLanguage } from '@/types';

export function getToolDisplayTitle(
  tool: Pick<IToolFrontmatter, 'title' | 'titleZh' | 'titleEn'>,
  language: TLanguage
): string {
  if (language === 'en') return tool.titleEn ?? tool.title;
  return tool.titleZh ?? tool.title;
}

