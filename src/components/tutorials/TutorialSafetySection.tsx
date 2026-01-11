import type { ITutorialFrontmatter } from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { formatDate } from '@/lib/utils';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';

export function TutorialSafetySection({ tutorial }: { tutorial: ITutorialFrontmatter }) {
  const language = getRequestLanguage();
  const checklist = tutorial.safety?.checklist?.filter((item) => item.trim().length > 0) ?? [];
  const notes = tutorial.safety?.notes?.filter((item) => item.trim().length > 0) ?? [];
  const sources = tutorial.safety?.sources ?? [];

  if (checklist.length === 0 && notes.length === 0 && sources.length === 0) return null;

  return (
    <SectionCard
      id="safety-checklist"
      className="mt-10"
      title={t(language, 'tutorial.safety.title')}
      description={t(language, 'tutorial.safety.desc')}
    >
      {checklist.length > 0 && (
        <div>
          <div className="text-sm font-medium text-card-foreground">{t(language, 'tutorial.safety.checklist')}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-card-foreground">{t(language, 'tutorial.safety.notes')}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {tutorial.safety?.updatedAt && (
        <div className="mt-4 text-xs text-muted-foreground">
          {t(language, 'tutorial.safety.checkedAt', { date: formatDate(tutorial.safety.updatedAt, language) })}
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-card-foreground">{t(language, 'tutorial.safety.sources')}</div>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            {sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-4"
              >
                {source.label} →
              </a>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
