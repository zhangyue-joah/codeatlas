import { cookies } from 'next/headers';
import type { TLanguage } from '@/types';
import { LANGUAGE_COOKIE_KEY } from '@/i18n/constants';
import { t } from '@/i18n/messages';

export function getRequestLanguage(): TLanguage {
  const value = cookies().get(LANGUAGE_COOKIE_KEY)?.value;
  return value === 'en' ? 'en' : 'zh';
}

export function tServer(key: string, vars?: Record<string, string | number | boolean | undefined>): string {
  return t(getRequestLanguage(), key, vars);
}

