'use client';

import { useEffect } from 'react';
import type { IToolFrontmatter, TLanguage } from '@/types';
import { CustomCompareTable } from '@/components/compare/CustomCompareTable';

interface ICompareResultModalProps {
  language: TLanguage;
  tools: { slug: string; frontmatter: IToolFrontmatter }[];
  onClose: () => void;
}

export function CompareResultModal({ language, tools, onClose }: ICompareResultModalProps) {
  const isZh = language !== 'en';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={isZh ? '关闭对比弹窗' : 'Close compare dialog'}
        onClick={onClose}
      />
      <div className="absolute inset-x-0 top-10 mx-auto w-[min(1100px,calc(100vw-2rem))] rounded-3xl bg-background p-4 shadow-modal ring-1 ring-border/40 sm:top-16 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-foreground">{isZh ? '对比结果' : 'Compare'}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isZh ? '对齐关键事实，快速做决策。' : 'Align key facts to decide faster.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={isZh ? '关闭' : 'Close'}
            title={isZh ? '关闭' : 'Close'}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-5 max-h-[70vh] overflow-auto">
          <CustomCompareTable language={language} tools={tools} />
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

