'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/i18n/messages';

export function useT() {
  const { language, setLanguage, toggleLanguage, mounted } = useLanguage();

  const translator = useMemo(() => {
    return (key: string, vars?: Record<string, string | number | boolean | undefined>) => t(language, key, vars);
  }, [language]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    mounted,
    t: translator,
  };
}

