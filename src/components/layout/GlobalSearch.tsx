'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ISearchIndexItem } from '@/services/searchIndexService';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useSearchIndex, type TSearchContentType } from '@/hooks/useSearchIndex';
import { SearchResultLink } from '@/components/search/SearchResultLink';
import { cn } from '@/lib/utils';
import { buildSearchHref } from '@/utils/query';
import { useT } from '@/i18n/client';
import { getContentTypeEntries } from '@/i18n/labels';

interface ISearchModalProps {
  open: boolean;
  query: string;
  loading: boolean;
  items: ISearchIndexItem[];
  type: TSearchContentType;
  onQueryChange: (query: string) => void;
  onTypeChange: (type: TSearchContentType) => void;
  onClose: () => void;
  onEnsureLoaded: () => void;
}

type TSearchTriggerVariant = 'button' | 'icon';

function SearchTriggerButton({
  onOpen,
  variant,
  ariaLabel,
  label,
}: {
  onOpen: () => void;
  variant: TSearchTriggerVariant;
  ariaLabel: string;
  label: string;
}) {
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={ariaLabel}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <span>{label}</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

function SearchDialogHeader({
  query,
  onQueryChange,
  type,
  onTypeChange,
  onClose,
  onEnsureLoaded,
}: Pick<ISearchModalProps, 'query' | 'onQueryChange' | 'type' | 'onTypeChange' | 'onClose' | 'onEnsureLoaded'>) {
  const { t, language } = useT();
  return (
    <div className="border-b border-border bg-background px-5 pb-4 pt-5">
      {/* 搜索输入区域 */}
      <div className="flex items-center gap-3 rounded-xl border border-input bg-muted/50 px-4 py-3 transition-all focus-within:border-primary focus-within:bg-background focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
        {/* 搜索图标 */}
        <svg
          className="h-5 w-5 shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>

        {/* 输入框 */}
        <input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onEnsureLoaded}
          placeholder={t('search.placeholder')}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        {/* 清空按钮 */}
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="清空搜索"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* ESC 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="hidden shrink-0 select-none rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-block"
        >
          ESC
        </button>
      </div>

      {/* 类型筛选 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TypeChip label={t('common.all')} active={type === 'all'} onClick={() => onTypeChange('all')} />
        {getContentTypeEntries(language).map(([key, label]) => (
          <TypeChip
            key={key}
            label={label}
            active={type === key}
            onClick={() => onTypeChange(key as TSearchContentType)}
          />
        ))}
      </div>
    </div>
  );
}

function SearchDialogBody({
  loading,
  items,
  onSelectItem,
  query,
  type,
}: Pick<ISearchModalProps, 'loading' | 'items' | 'query' | 'type'> & { onSelectItem: () => void }) {
  const { t } = useT();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {t('search.loading')}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-3 h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-sm text-muted-foreground">{t('search.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.slice(0, 20).map((item) => (
        <SearchResultLink key={`${item.type}:${item.slug}`} item={item} query={query} onSelect={onSelectItem} />
      ))}
      <div className="pt-2">
        <Link
          href={buildSearchHref('/search', { q: query || undefined, type: type === 'all' ? undefined : type })}
          onClick={onSelectItem}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-primary transition-colors',
            'hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          {t('search.viewAll')}
        </Link>
      </div>
    </div>
  );
}

function SearchDialog(props: ISearchModalProps) {
  const { open, query, loading, items, type, onQueryChange, onTypeChange, onClose, onEnsureLoaded } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const content = (
    <>
      {/* 遮罩层 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* 弹窗容器 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '12vh 16px 16px',
        }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <SearchDialogHeader
            query={query}
            onQueryChange={onQueryChange}
            type={type}
            onTypeChange={onTypeChange}
            onClose={onClose}
            onEnsureLoaded={onEnsureLoaded}
          />
          <div className="max-h-[50vh] overflow-auto bg-muted/40 p-3">
            <SearchDialogBody loading={loading} items={items} query={query} type={type} onSelectItem={onClose} />
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}

/**
 * 全局搜索入口（⌘/Ctrl+K 打开）。
 */
export function GlobalSearch({
  variant = 'button',
  ariaLabel,
}: {
  variant?: TSearchTriggerVariant;
  ariaLabel?: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const { query, setQuery, type, setType, loading, filteredItems, ensureIndexLoaded, reset } = useSearchIndex();

  // 锁定背景滚动
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const openWithLoad = useCallback(() => {
    setOpen(true);
    void ensureIndexLoaded();
  }, [ensureIndexLoaded]);

  const openFromHotkey = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      openWithLoad();
    },
    [openWithLoad]
  );

  const hotkeys = useMemo(
    () => [
      { key: 'k', metaKey: true, handler: openFromHotkey },
      { key: 'k', ctrlKey: true, handler: openFromHotkey },
      { key: 'Escape', handler: () => close() },
    ],
    [close, openFromHotkey]
  );

  useHotkeys(hotkeys);

  return (
    <>
      <SearchTriggerButton
        onOpen={openWithLoad}
        variant={variant}
        ariaLabel={ariaLabel ?? t('search.trigger')}
        label={t('search.trigger')}
      />
      <SearchDialog
        open={open}
        query={query}
        loading={loading}
        items={filteredItems}
        type={type}
        onQueryChange={setQuery}
        onTypeChange={setType}
        onClose={close}
        onEnsureLoaded={() => void ensureIndexLoaded()}
      />
    </>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}
