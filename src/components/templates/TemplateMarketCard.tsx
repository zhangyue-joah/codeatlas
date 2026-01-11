import Link from 'next/link';
import type { ITemplateFrontmatter, TLanguage } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton';
import { cn, formatDate } from '@/lib/utils';
import { getTemplateTypeLabel } from '@/i18n/labels';
import { t } from '@/i18n/messages';

interface ITemplateMarketCardProps {
  language: TLanguage;
  slug: string;
  template: ITemplateFrontmatter;
  className?: string;
}

export function TemplateMarketCard({ language, slug, template, className }: ITemplateMarketCardProps) {
  const isZh = language !== 'en';
  const typeLabel = getTemplateTypeLabel(language, template.type);
  const versionPart = template.version ? t(language, 'templates.meta.versionPart', { version: template.version }) : '';
  const meta = t(language, 'templates.meta', { date: formatDate(template.updatedAt, language), versionPart });
  const copyVariant = template.type === 'mcp-config' ? 'primary' : 'outline';

  const toolBadges = template.applicableTools.slice(0, 4);
  const toolExtra = template.applicableTools.length - toolBadges.length;
  const templateLines = template.template.split('\n');
  const previewLineCount = Math.min(12, templateLines.length);
  const previewText = templateLines.slice(0, previewLineCount).join('\n').trimEnd();
  const hasMorePreview = templateLines.length > previewLineCount;

  const actionClassName =
    'inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
            <Link href={`/templates/${slug}`} className="hover:underline">
              {template.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{template.description}</p>
        </div>
        <div className="shrink-0">
          <Badge>{typeLabel}</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {toolBadges.map((tool) => (
          <Badge key={tool} className="bg-muted">
            {tool}
          </Badge>
        ))}
        {toolExtra > 0 ? (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {isZh ? `+${toolExtra} 个工具` : `+${toolExtra} tools`}
          </span>
        ) : null}
      </div>

      <details className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/10">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <span className="flex items-center gap-2">
            <span>{isZh ? '预览' : 'Preview'}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {isZh ? `前 ${previewLineCount} 行` : `first ${previewLineCount} lines`}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">{isZh ? '展开' : 'Expand'}</span>
        </summary>
        <div className="border-t border-border px-4 py-3">
          <pre className="max-h-48 overflow-auto rounded-lg bg-background p-3 text-xs text-foreground">
            <code>{previewText}</code>
          </pre>
          {hasMorePreview ? (
            <div className="mt-2 text-xs text-muted-foreground">{isZh ? '…更多内容请打开详情页' : '…open details for full content'}</div>
          ) : null}
        </div>
      </details>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">{meta}</div>
        <div className="flex items-center gap-2">
          <CopyToClipboardButton text={template.template} variant={copyVariant} />
          <Link href={`/templates/${slug}`} className={cn(actionClassName)}>
            {t(language, 'common.open')}
          </Link>
        </div>
      </div>
    </div>
  );
}
