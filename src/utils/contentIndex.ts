import type {
  ICompareFrontmatter,
  ITemplateFrontmatter,
  ITutorialFrontmatter,
  IToolFrontmatter,
} from '@/types';

interface IHasSlugAndTitle<TFrontmatter extends { title: string }> {
  slug: string;
  frontmatter: TFrontmatter;
}

function buildTitleIndex<TFrontmatter extends { title: string }>(
  items: Array<IHasSlugAndTitle<TFrontmatter>>
): Record<string, string> {
  return items.reduce<Record<string, string>>((acc, item) => {
    acc[item.slug] = item.frontmatter.title;
    return acc;
  }, {});
}

export function buildToolTitleIndex(items: Array<IHasSlugAndTitle<IToolFrontmatter>>) {
  return buildTitleIndex(items);
}

export function buildCompareTitleIndex(items: Array<IHasSlugAndTitle<ICompareFrontmatter>>) {
  return buildTitleIndex(items);
}

export function buildTutorialTitleIndex(items: Array<IHasSlugAndTitle<ITutorialFrontmatter>>) {
  return buildTitleIndex(items);
}

export function buildTemplateTitleIndex(items: Array<IHasSlugAndTitle<ITemplateFrontmatter>>) {
  return buildTitleIndex(items);
}

