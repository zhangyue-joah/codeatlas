import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';

export const mdxComponents: MDXComponents = {
  a: ({ href, className, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const mergedClassName = cn('text-primary underline underline-offset-4 hover:opacity-90', className);
    if (!href) return <a {...props} className={mergedClassName} />;

    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    if (isExternal) {
      return <a href={href} {...props} target="_blank" rel="noreferrer noopener" className={mergedClassName} />;
    }

    return (
      <Link href={href} className={mergedClassName}>
        {props.children}
      </Link>
    );
  },
  h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2
      {...props}
      className={cn(
        'mt-10 scroll-mt-24 font-display text-xl font-medium tracking-[-0.015em] text-foreground',
        className
      )}
    />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 {...props} className={cn('mt-8 scroll-mt-24 font-display text-lg font-medium text-foreground', className)} />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p {...props} className={cn('mt-4 leading-7 text-muted-foreground', className)} />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul {...props} className={cn('mt-4 list-disc space-y-2 pl-6', className)} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} className={cn('mt-4 list-decimal space-y-2 pl-6', className)} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li {...props} className={cn('text-muted-foreground', className)} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote {...props} className={cn('mt-6 border-l-4 border-border pl-4 text-muted-foreground', className)} />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code {...props} className={cn('rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground', className)} />
  ),
  pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre {...props} className={cn('mt-6 overflow-auto rounded-lg border border-border bg-muted p-4 text-sm', className)} />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="mt-6 overflow-auto">
      <table {...props} className={cn('w-full border-collapse text-left text-sm', className)} />
    </div>
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th {...props} className={cn('border-b border-border bg-muted px-3 py-2 font-semibold text-foreground', className)} />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td {...props} className={cn('border-b border-border px-3 py-2 text-muted-foreground', className)} />
  ),
};
