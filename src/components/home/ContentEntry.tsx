import Link from 'next/link';
import { getAllCompares, getAllTools, getAllTutorials } from '@/lib/content';
import { Badge } from '@/components/ui/Badge';
import type { ICompareFrontmatter, ITutorialFrontmatter, IToolFrontmatter } from '@/types';
import { getRequestLanguage, tServer } from '@/i18n/server';
import { getToolProductTypeLabel, getTutorialDifficultyLabel } from '@/i18n/labels';
import { getToolDisplayTitle } from '@/lib/toolDisplay';

export function ContentEntry() {
  const tools = pickFeatured(getAllTools(), 3);
  const compares = pickFeatured(getAllCompares(), 2);
  const tutorials = pickFeatured(getAllTutorials(), 2);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Popular Tools */}
          <HomeToolsColumn tools={tools} />

          {/* Popular Compares */}
          <HomeComparesColumn compares={compares} />

          {/* Latest Tutorials */}
          <HomeTutorialsColumn tutorials={tutorials} />
        </div>
      </div>
    </section>
  );
}

function pickFeatured<T extends { frontmatter: { featured?: boolean } }>(items: T[], count: number): T[] {
  const featured = items.filter((item) => item.frontmatter.featured);
  if (featured.length >= count) return featured.slice(0, count);
  return items.slice(0, count);
}

function ColumnHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
        {tServer('home.content.viewAll')}
      </Link>
    </div>
  );
}

function HomeToolsColumn({ tools }: { tools: { slug: string; frontmatter: IToolFrontmatter }[] }) {
  const language = getRequestLanguage();
  return (
    <div>
      <ColumnHeader title={tServer('home.content.popularTools')} href="/tools" />
      <div className="mt-6 space-y-4">
        {tools.length === 0 ? (
          <EmptyHint href="/tools" />
        ) : (
          tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-card-foreground">{getToolDisplayTitle(tool.frontmatter, language)}</h3>
                {tool.frontmatter.productType[0] && (
                  <Badge>{getToolProductTypeLabel(language, tool.frontmatter.productType[0])}</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tool.frontmatter.description}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function HomeComparesColumn({ compares }: { compares: { slug: string; frontmatter: ICompareFrontmatter }[] }) {
  return (
    <div>
      <ColumnHeader title={tServer('home.content.popularCompares')} href="/compare" />
      <div className="mt-6 space-y-4">
        {compares.length === 0 ? (
          <EmptyHint href="/compare" />
        ) : (
          compares.map((compare) => (
            <Link
              key={compare.slug}
              href={`/compare/${compare.slug}`}
              className="block rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-card-foreground">{compare.frontmatter.title}</h3>
                <Badge className="bg-muted">
                  {compare.frontmatter.toolA.name} vs {compare.frontmatter.toolB.name}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{compare.frontmatter.description}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function HomeTutorialsColumn({ tutorials }: { tutorials: { slug: string; frontmatter: ITutorialFrontmatter }[] }) {
  const language = getRequestLanguage();
  return (
    <div>
      <ColumnHeader title={tServer('home.content.latestTutorials')} href="/tutorials" />
      <div className="mt-6 space-y-4">
        {tutorials.length === 0 ? (
          <EmptyHint href="/tutorials" />
        ) : (
          tutorials.map((tutorial) => (
            <Link
              key={tutorial.slug}
              href={`/tutorials/${tutorial.slug}`}
              className="block rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-card-foreground">{tutorial.frontmatter.title}</h3>
                <Badge>{getTutorialDifficultyLabel(language, tutorial.frontmatter.difficulty)}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tutorial.frontmatter.description}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyHint({ href }: { href: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground shadow-card">
      {tServer('home.content.emptyHint')}{' '}
      <Link href={href} className="text-foreground hover:underline">
        {tServer('home.content.openArrow')}
      </Link>
    </div>
  );
}
