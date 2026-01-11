import type { TLanguage } from '@/types';
import { type TCompareDimension, REQUIRED_COMPARE_DIMENSIONS } from '@/config/compareDimensions';

const COMPARE_DIMENSION_LABEL_EN: Record<TCompareDimension, string> = {
  上下文能力: 'Context',
  'Agent 能力': 'Agent',
  扩展能力生态: 'Ecosystem',
  可控性: 'Controllability',
  'IDE / CLI 集成': 'IDE / CLI',
  团队功能: 'Team features',
  隐私与合规: 'Privacy & compliance',
  稳定性: 'Reliability',
  价格与性价比: 'Pricing & value',
};

export function isCompareDimension(value: string): value is TCompareDimension {
  return (REQUIRED_COMPARE_DIMENSIONS as readonly string[]).includes(value);
}

export function getCompareDimensionLabel(language: TLanguage, dimension: string): string {
  if (language !== 'en') return dimension;
  if (!isCompareDimension(dimension)) return dimension;
  return COMPARE_DIMENSION_LABEL_EN[dimension];
}

