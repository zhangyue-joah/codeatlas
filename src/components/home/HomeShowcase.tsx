import { getAllTutorials } from '@/lib/content';
import { ShowcaseCarousel, type TShowcaseItem } from '@/components/home/ShowcaseCarousel';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { getTutorialDifficultyLabel } from '@/i18n/labels';

/**
 * 热门工具优先级列表（按市场热度排序）
 * 用于首页精选教程的排序依据
 */
const POPULAR_TOOLS_PRIORITY = [
  'claude-code',
  'codex',
  'gemini-cli',
  'cursor',
  'github-copilot',
  'augment-code',
];

function pickShowcaseItems(): TShowcaseItem[] {
  const language = getRequestLanguage();
  const tutorials = getAllTutorials();
  const gettingStarted = tutorials.filter((item) => item.frontmatter.type === 'getting-started');
  const candidates = gettingStarted.length > 0 ? gettingStarted : tutorials;

  // 按热门工具优先级排序
  const sorted = [...candidates].sort((a, b) => {
    const aSlug = a.slug.toLowerCase();
    const bSlug = b.slug.toLowerCase();
    const aIndex = POPULAR_TOOLS_PRIORITY.findIndex((tool) => aSlug.includes(tool));
    const bIndex = POPULAR_TOOLS_PRIORITY.findIndex((tool) => bSlug.includes(tool));
    // 在优先级列表中的排前面，不在列表中的排后面
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const selected = sorted.slice(0, 6);

  return selected.map((tutorial) => {
    const metaParts = [
      tutorial.frontmatter.estimatedTime,
      getTutorialDifficultyLabel(language, tutorial.frontmatter.difficulty),
      tutorial.frontmatter.requiredTools?.[0],
    ].filter(Boolean);

    return {
      href: `/tutorials/${tutorial.slug}`,
      title: tutorial.frontmatter.title,
      description: tutorial.frontmatter.description,
      meta: metaParts.join(' · '),
      tone: 'light',
    };
  });
}

/**
 * 首页精选实操：只给标题 + 一句话，点进去就是 SOP。
 */
export function HomeShowcase() {
  const items = pickShowcaseItems();

  return (
    <ShowcaseCarousel
      items={items}
      title={tServer('home.showcase.title')}
      description={tServer('home.showcase.desc')}
      actionHref="/tutorials"
      actionLabel={tServer('home.showcase.action')}
    />
  );
}
