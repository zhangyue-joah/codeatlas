'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TLanguage } from '@/types';
import { LANGUAGE_COOKIE_KEY, LANGUAGE_STORAGE_KEY } from '@/i18n/constants';

export interface ILanguageContextValue {
  language: TLanguage;
  setLanguage: (language: TLanguage) => void;
  toggleLanguage: () => void;
  mounted: boolean;
}

export const LanguageContext = createContext<ILanguageContextValue | null>(null);

function isLanguage(value: string): value is TLanguage {
  return value === 'zh' || value === 'en';
}

function toHtmlLang(language: TLanguage): string {
  return language === 'zh' ? 'zh-CN' : 'en';
}

function setLanguageCookie(language: TLanguage) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${language}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * 语言 Provider（客户端）：
 * - SSR 使用 initialLanguage（来自服务端 cookie）避免“中英混排/闪烁”
 * - 客户端持久化 localStorage，并同步 cookie 给服务端组件使用（router.refresh）
 */
export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: TLanguage;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<TLanguage>(initialLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && isLanguage(saved) && saved !== initialLanguage) setLanguageState(saved);
    } catch {
      // ignore
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
    setLanguageCookie(language);
    document.documentElement.lang = toHtmlLang(language);
    router.refresh();
  }, [language, mounted, router]);

  const setLanguage = useCallback((next: TLanguage) => setLanguageState(next), []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  const value = useMemo<ILanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, mounted }),
    [language, mounted, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

