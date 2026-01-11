'use client';

import type { TLanguage } from '@/types';

/**
 * 语言切换按钮：zh/en（用于 Header 等 UI 文案切换）。
 */
export function LanguageToggle({
  language,
  onToggle,
}: {
  language: TLanguage;
  onToggle: () => void;
}) {
  const label =
    language === 'zh' ? '切换语言（当前：中文）' : 'Switch language (current: English)';
  const current = language === 'zh' ? '中文' : 'EN';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={label}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <span>{current}</span>
    </button>
  );
}
