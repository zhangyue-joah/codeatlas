import type { TToolCapability } from './tool';

/** 教程类型 */
export type TTutorialType =
  | 'getting-started'
  | 'how-to'
  | 'automation'
  | 'team-practice'
  | 'quality-control';

/** 教程难度 */
export type TDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** SOP 步骤 */
export interface ISOPStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  image?: string;
  tips?: string[];
  warnings?: string[];
}

/** 教程 Frontmatter */
export interface ITutorialFrontmatter {
  slug: string;
  title: string;
  description: string;
  type: TTutorialType;
  difficulty: TDifficulty;
  goal: string;
  requiredTools: string[];
  /** 教程需要的工具能力（用于判断“能不能跑通”）。 */
  requiredCapabilities: TToolCapability[];
  estimatedTime: string;
  stepsOverview: string[];
  /**
   * 结构化 SOP 步骤（可选）：优先用它渲染步骤卡片；缺省时仅渲染 stepsOverview + MDX 正文。
   */
  steps?: ISOPStep[];
  /**
   * 安全与合规（可选）：用于教程页结构化展示“检查点”，避免只靠正文约束。
   */
  safety?: {
    checklist?: string[];
    notes?: string[];
    updatedAt?: string;
    sources?: { label: string; url: string }[];
  };
  keyTips: string[];
  commonFailures: {
    problem: string;
    solution: string;
  }[];
  acceptanceCriteria: string[];
  relatedTools: string[];
  relatedTemplates: string[];
  nextTutorial?: string;
  prevTutorial?: string;
  updatedAt: string;
  /** 适用版本（可选）：用于满足“明确适用版本” */
  version?: string;
  /** 是否在首页/列表中置顶展示（可选） */
  featured?: boolean;
  author?: string;
  keywords: string[];
  seoTitle?: string;
  seoDescription?: string;
}

/** 教程数据 */
export interface ITutorial {
  frontmatter: ITutorialFrontmatter;
  content: string;
}
