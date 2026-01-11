import type { IToolFrontmatter, TLanguage } from '@/types';
import { toTrimmedString } from '@/lib/utils';

export function formatToolBillingCycle(
  cycle: IToolFrontmatter['pricing']['billingCycle'] | undefined,
  language: TLanguage
): string | null {
  if (!cycle) return null;
  if (language === 'en') {
    if (cycle === 'monthly') return 'mo';
    if (cycle === 'yearly') return 'yr';
    return 'usage';
  }
  if (cycle === 'monthly') return '月';
  if (cycle === 'yearly') return '年';
  return '用量';
}

export function formatToolStartingPrice(
  tool: Pick<IToolFrontmatter, 'pricing'>,
  language: TLanguage
): string | null {
  const price = toTrimmedString(tool.pricing.startingPrice);
  const currency = toTrimmedString(tool.pricing.currency);
  if (!price || !currency) return null;
  const cycle = formatToolBillingCycle(tool.pricing.billingCycle, language);
  if (cycle) {
    if (language === 'en') return `from ${price} ${currency}/${cycle}`;
    return `起步 ${price} ${currency}/${cycle}`;
  }
  if (language === 'en') return `from ${price} ${currency}`;
  return `起步 ${price} ${currency}`;
}

