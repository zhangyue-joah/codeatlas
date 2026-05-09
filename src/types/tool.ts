/** 工具能力枚举 */
export type TToolCapability =
  | 'repo-context'
  | 'agent-execution'
  | 'mcp-server'
  | 'skills-plugins'
  | 'local-command'
  | 'external-system'
  | 'read-only'
  | 'read-write'
  | 'execute';

/** AI 编程产品形态（产品分类） */
export type TToolProductType =
  | 'ide'
  | 'ide-extension'
  | 'cli'
  | 'web-app';

/** 工具分类枚举 */
export type TToolCategory =
  | 'code-completion'
  | 'agent-coding'
  | 'testing'
  | 'code-review'
  | 'repo-chat'
  | 'doc-generation'
  | 'devops';

/** 价格模式 */
export type TPricingModel =
  | 'free'
  | 'freemium'
  | 'subscription'
  | 'usage-based'
  | 'one-time';

export type TPermissionLevel = 'read-only' | 'read-write' | 'execute' | 'unknown';

export interface IExternalSystemIntegration {
  name: string;
  /** 对外部系统的典型权限等级（可选） */
  permission?: TPermissionLevel;
  /** 集成入口或官方说明链接（可选） */
  url?: string;
  /** 说明/注意事项（可选） */
  notes?: string;
}

export interface IMcpServerExample {
  name: string;
  url?: string;
  notes?: string;
}

/** 工具 Frontmatter */
export interface IToolFrontmatter {
  slug: string;
  title: string;
  /** 产品中文名（可选；用于中文界面优先展示） */
  titleZh?: string;
  /** 产品英文名（可选；用于英文界面优先展示） */
  titleEn?: string;
  description: string;
  logo: string;
  website: string;
  /** 产品形态：用于“AI 编程产品分类”筛选 */
  productType: TToolProductType[];
  category: TToolCategory[];
  targetUsers: string[];
  notFor: string[];
  capabilities: TToolCapability[];
  useCases: string[];
  pros: string[];
  cons: string[];
  onboardingTime: string;
  dependencies: string[];
  /** 是否在首页/列表中置顶展示（可选） */
  featured?: boolean;
  pricing: {
    model: TPricingModel;
    free: boolean;
    /** 起步价格（可选；缺省表示“以官网为准/未核对”） */
    startingPrice?: string | number;
    /** 货币（可选；缺省表示“以官网为准/未核对”） */
    currency?: string;
    /** 计费周期（可选；缺省表示“以官网为准/未核对”） */
    billingCycle?: 'monthly' | 'yearly' | 'usage';
    hasEducation: boolean;
    hasTeam: boolean;
    hasEnterprise: boolean;
    supportsInvoice: boolean;
    supportsContract: boolean;
  };
  /**
   * 外部系统集成（可选）：当 capabilities 包含 `external-system` 时建议填写。
   * 示例：GitHub、GitLab、Jira、Linear、Slack、Postgres、MySQL 等。
   */
  externalSystems?: string[];
  /** 外部系统集成细节（可选，建议逐步补齐；向下兼容 externalSystems） */
  externalSystemIntegrations?: IExternalSystemIntegration[];
  /**
   * MCP Server 支持的示例/推荐（可选）：当 capabilities 包含 `mcp-server` 时建议填写。
   */
  mcpServers?: string[];
  /** MCP Server 示例（可选，建议逐步补齐；向下兼容 mcpServers） */
  mcpServerExamples?: IMcpServerExample[];
  /** 购买信息：用于“查看购买”卡片（可选，建议逐步补齐） */
  purchase?: {
    officialUrl?: string;
    authorizedUrl?: string;
    /** 购买/价格信息核对日期（可选，ISO 字符串）；缺省时回退到顶层 updatedAt */
    updatedAt?: string;
    /** 信息来源（可选）：要求可追溯 */
    sources?: { label: string; url: string }[];
    notes?: string[];
  };
  privacy: {
    dataRetention: string;
    localProcessing: boolean;
    enterpriseCompliance: string[];
    /** 隐私/数据策略链接（可选） */
    policyUrl?: string;
    /** 隐私信息核对日期（可选，ISO 字符串）；缺省时回退到顶层 updatedAt */
    updatedAt?: string;
  };
  relatedTools: string[];
  relatedTutorials: string[];
  /** 关联模板（可选）：用于工具页“关联模板”与导航过滤 */
  relatedTemplates?: string[];
  relatedCompares: string[];
  updatedAt: string;
  version: string;
  affiliateLink?: string;
  affiliateDisclosure?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
}

/** 工具数据（包含 frontmatter 和内容） */
export interface ITool {
  frontmatter: IToolFrontmatter;
  content: string;
}
