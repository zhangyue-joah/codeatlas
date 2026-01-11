import type { IToolFrontmatter } from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';
import { cn } from '@/lib/utils';

interface IToolActionPanelProps {
  tool: IToolFrontmatter;
  id?: string;
}

interface IToolActionButtonsProps {
  tool: IToolFrontmatter;
  className?: string;
}

/**
 * 工具页固定“行动”区块：把开始入口收敛到同一位置，减少跳出与迷路。
 */
export function ToolActionPanel({ tool, id }: IToolActionPanelProps) {
  const language = getRequestLanguage();

  return (
    <SectionCard id={id} title={t(language, 'tool.action.title')} description={t(language, 'tool.action.desc')}>
      <ToolActionButtons tool={tool} className="grid gap-3" />
    </SectionCard>
  );
}

export function ToolActionButtons({ tool, className }: IToolActionButtonsProps) {
  const language = getRequestLanguage();

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:justify-end', className)}>
      <a
        href={tool.website}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
      >
        {t(language, 'tool.action.cta.website')}
      </a>
    </div>
  );
}
