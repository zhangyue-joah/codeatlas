/**
 * 对比维度（固定）
 *
 * 说明：对齐 PRD 的“对比维度（固定）”，用于：
 * - 构建期校验（缺失维度直接失败，避免对比页口径不一致）
 * - 页面排序（让不同对比页的表格顺序一致，降低阅读成本）
 */
export const REQUIRED_COMPARE_DIMENSIONS = [
  '上下文能力',
  'Agent 能力',
  '扩展能力生态',
  '可控性',
  'IDE / CLI 集成',
  '团队功能',
  '隐私与合规',
  '稳定性',
  '价格与性价比',
] as const;

export type TCompareDimension = (typeof REQUIRED_COMPARE_DIMENSIONS)[number];

