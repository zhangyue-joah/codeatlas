import { formatDate } from '@/lib/utils';
import { getRequestLanguage, tServer } from '@/i18n/server';

interface IPageHeaderProps {
  title: string;
  description?: string;
  updatedAt?: string;
  /** 内容适用版本（如 2025-12 / v1.2），用于满足 PRD 的"明确适用版本"要求 */
  version?: string;
  align?: 'left' | 'center';
  variant?: 'page' | 'inline';
  /** default: 标准页面头部; compact: 紧凑; minimal: 最小化（适合列表页） */
  density?: 'default' | 'compact' | 'minimal';
  headline?: 'title' | 'description';
}

export function PageHeader({
  title,
  description,
  updatedAt,
  version,
  align = 'left',
  variant = 'page',
  density = 'default',
  headline = 'title',
}: IPageHeaderProps) {
  const language = getRequestLanguage();
  const center = align === 'center';
  const compact = density === 'compact';
  const minimal = density === 'minimal';
  const useDescriptionHeadline = headline === 'description' && Boolean(description);

  const headingClassName = minimal
    ? 'text-balance font-display text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl'
    : compact
      ? 'text-balance font-display text-2xl font-medium tracking-[-0.02em] text-foreground sm:text-3xl'
      : 'text-balance font-display text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl';

  const descriptionClassName = center
    ? minimal
      ? 'mx-auto mt-1.5 max-w-2xl text-balance text-sm text-muted-foreground'
      : compact
        ? 'mx-auto mt-3 max-w-2xl text-balance text-sm leading-6 text-muted-foreground sm:text-base'
        : 'mx-auto mt-4 max-w-2xl text-balance text-muted-foreground'
    : minimal
      ? 'mt-1.5 max-w-3xl text-balance text-sm text-muted-foreground'
      : compact
        ? 'mt-3 max-w-3xl text-balance text-sm leading-6 text-muted-foreground sm:text-base'
        : 'mt-4 max-w-3xl text-balance text-muted-foreground';

  const containerPadding = center
    ? minimal
      ? 'mx-auto max-w-7xl px-4 py-4 text-center sm:px-6 sm:py-5 lg:px-8'
      : compact
        ? 'mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8'
        : 'mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8'
    : minimal
      ? 'mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8'
      : compact
        ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8'
        : 'mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8';

  if (variant === 'inline') {
    return (
      <div className={center ? 'border-b border-border/50 pb-6 text-center' : 'border-b border-border/50 pb-6'}>
        {useDescriptionHeadline ? <h1 className="sr-only">{title}</h1> : null}
        {useDescriptionHeadline ? (
          <p className={headingClassName}>{description}</p>
        ) : (
          <h1 className={headingClassName}>{title}</h1>
        )}
        {description && !useDescriptionHeadline ? <p className={descriptionClassName}>{description}</p> : null}
        {(updatedAt || version) && (
          <p className={minimal ? 'mt-2 text-xs text-muted-foreground' : compact ? 'mt-4 text-sm text-muted-foreground' : 'mt-5 text-sm text-muted-foreground'}>
            {updatedAt && <span>{tServer('common.updatedAt', { date: formatDate(updatedAt, language) })}</span>}
            {updatedAt && version && <span className="mx-2">·</span>}
            {version && <span>{tServer('common.version', { version })}</span>}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-border/50 bg-background">
      <div className={containerPadding}>
        {useDescriptionHeadline ? <h1 className="sr-only">{title}</h1> : null}
        {useDescriptionHeadline ? (
          <p className={headingClassName}>{description}</p>
        ) : (
          <h1 className={headingClassName}>{title}</h1>
        )}
        {description && !useDescriptionHeadline ? <p className={descriptionClassName}>{description}</p> : null}
        {(updatedAt || version) && (
          <p className={minimal ? 'mt-2 text-xs text-muted-foreground' : compact ? 'mt-4 text-sm text-muted-foreground' : 'mt-5 text-sm text-muted-foreground'}>
            {updatedAt && <span>{tServer('common.updatedAt', { date: formatDate(updatedAt, language) })}</span>}
            {updatedAt && version && <span className="mx-2">·</span>}
            {version && <span>{tServer('common.version', { version })}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
