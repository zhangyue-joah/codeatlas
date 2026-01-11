import type { ReactNode } from 'react';
import { ContentCard } from '@/components/content/ContentCard';

export interface IRelatedContentCardItem {
  href: string;
  title: string;
  description: string;
  badge?: ReactNode;
  meta?: ReactNode;
}

interface IRelatedContentCardsProps {
  title: string;
  items: IRelatedContentCardItem[];
  showTitle?: boolean;
}

export function RelatedContentCards({ title, items, showTitle = true }: IRelatedContentCardsProps) {
  if (items.length === 0) return null;

  return (
    <div>
      {showTitle ? <div className="text-sm font-medium text-card-foreground">{title}</div> : null}
      <div
        className={
          showTitle
            ? 'mt-3 flex flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto pb-2'
            : 'flex flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto pb-2'
        }
      >
        {items.map((item) => (
          <ContentCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.description}
            badges={item.badge}
            meta={item.meta}
            className="w-[280px] shrink-0 snap-start p-4 sm:w-[320px]"
          />
        ))}
      </div>
    </div>
  );
}
