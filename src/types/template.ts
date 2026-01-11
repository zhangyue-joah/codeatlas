/** 模板类型 */
export type TTemplateType =
  | 'agent-instruction'
  | 'mcp-config'
  | 'prompt-recipe'
  | 'skill';

/** 模板 Frontmatter */
export interface ITemplateFrontmatter {
  slug: string;
  title: string;
  description: string;
  type: TTemplateType;
  applicableTools: string[];
  /**
   * 适用场景标签（1–2 个）：用于列表页快速筛选与“打开→找到→复制→用”。
   */
  scenarios: string[];
  /**
   * 使用前需要替换的变量/占位符（可为空数组）。
   */
  placeholders: string[];
  /**
   * 依赖（模型/工具/环境等，可为空数组）。
   */
  dependencies: string[];
  template: string;
  /**
   * 最小可用示例：用于直接复制运行/粘贴（不写教程）。
   */
  example: string;
  /** 是否在首页/列表中置顶展示（可选） */
  featured?: boolean;
  variables?: {
    name: string;
    description: string;
    example: string;
  }[];
  notes: string[];
  relatedTutorials: string[];
  updatedAt: string;
  /** 适用版本（可选）：用于满足“明确适用版本” */
  version?: string;
  keywords: string[];
}

/** 模板数据 */
export interface ITemplate {
  frontmatter: ITemplateFrontmatter;
  content: string;
}
