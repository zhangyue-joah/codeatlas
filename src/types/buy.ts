export type TBuyChannelType = 'official' | 'authorized' | 'marketplace' | 'enterprise' | 'risky';
export type TBuyRisk = 'low' | 'medium' | 'high';
export type TBuyAudience = 'individual' | 'team' | 'enterprise';

export interface IBuyChannel {
  id: string;
  title: string;
  description: string;
  type: TBuyChannelType;
  risk: TBuyRisk;
  audiences: TBuyAudience[];
  /** 渠道入口（可选） */
  href?: string;
  price: string;
  outcome: string;
  notes?: string;
}
