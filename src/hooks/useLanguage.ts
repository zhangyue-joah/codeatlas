'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/components/layout/LanguageProvider';

/**
 * 轻量语言状态（仅用于 UI 文案切换）：由 LanguageProvider 提供。
 */
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used within <LanguageProvider />');
  }
  return value;
}
