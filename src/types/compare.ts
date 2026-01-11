/** 对比维度评分 */
export interface IComparisonDimension {
  dimension: string;
  toolA: {
    score: number;
    description: string;
  };
  toolB: {
    score: number;
    description: string;
  };
}

/** 场景对比 */
export interface IScenarioComparison {
  scenario: string;
  description: string;
  winner: 'toolA' | 'toolB' | 'tie';
  reason: string;
}

/** 对比 Frontmatter */
export interface ICompareFrontmatter {
  slug: string;
  title: string;
  description: string;
  toolA: {
    slug: string;
    name: string;
    logo: string;
  };
  toolB: {
    slug: string;
    name: string;
    logo: string;
  };
  /** 是否在首页/列表中置顶展示（可选） */
  featured?: boolean;
  conclusions: {
    forBeginners: {
      recommendation: 'toolA' | 'toolB';
      reason: string;
    };
    forProfessionals: {
      recommendation: 'toolA' | 'toolB';
      reason: string;
    };
    forTeams: {
      recommendation: 'toolA' | 'toolB';
      reason: string;
    };
  };
  dimensions: IComparisonDimension[];
  scenarios: IScenarioComparison[];
  costAnalysis: {
    toolA: {
      monthlyIndividual: string;
      monthlyTeam: string;
      hiddenCosts: string[];
    };
    toolB: {
      monthlyIndividual: string;
      monthlyTeam: string;
      hiddenCosts: string[];
    };
  };
  /**
   * 风险与合规（可选）：用于“成本与风险分析”模块的结构化展示。
   * 缺省时会展示默认风险清单（用于占位与写作提示）。
   */
  riskAnalysis?: {
    checklist?: string[];
    complianceNotes?: string[];
    /** 风险信息核对日期（可选，ISO 字符串） */
    updatedAt?: string;
    /** 来源（可选）：用于可追溯 */
    sources?: { label: string; url: string }[];
  };
  finalVerdict: string;
  updatedAt: string;
  /** 适用版本（可选）：用于满足“明确适用版本” */
  version?: string;
  keywords: string[];
  seoTitle?: string;
  seoDescription?: string;
}

/** 对比数据 */
export interface ICompare {
  frontmatter: ICompareFrontmatter;
  content: string;
}
