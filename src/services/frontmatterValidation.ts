import type {
  ICompareFrontmatter,
  ITemplateFrontmatter,
  ITutorialFrontmatter,
  IToolFrontmatter,
} from '@/types';
import { TOOL_CAPABILITY_LABEL_ZH, TOOL_PRODUCT_TYPE_LABEL_ZH } from '@/i18n/labels';
import { REQUIRED_COMPARE_DIMENSIONS } from '@/config/compareDimensions';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

function assertStringArray(
  value: unknown,
  messagePrefix: string,
  options?: { allowEmpty?: boolean; maxLength?: number; minLength?: number }
): asserts value is string[] {
  const allowEmpty = options?.allowEmpty ?? true;
  const minLength = options?.minLength ?? 0;
  const maxLength = options?.maxLength ?? Infinity;

  assert(Array.isArray(value), `${messagePrefix} 必须为数组`);
  if (!allowEmpty) {
    assert(value.length > 0, `${messagePrefix} 不能为空`);
  }
  assert(value.length >= minLength, `${messagePrefix} 长度必须 ≥ ${minLength}`);
  assert(value.length <= maxLength, `${messagePrefix} 长度必须 ≤ ${maxLength}`);
  for (const item of value) {
    assert(isNonEmptyString(item), `${messagePrefix} 存在空值`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertSlugMatchesFile(frontmatterSlug: unknown, fileSlug: string): void {
  assert(
    isNonEmptyString(frontmatterSlug),
    `frontmatter.slug 缺失或为空（file: ${fileSlug}）`
  );
  assert(
    frontmatterSlug === fileSlug,
    `frontmatter.slug 必须与文件名一致：${String(frontmatterSlug)} !== ${fileSlug}`
  );
}

function assertAffiliateDisclosure(frontmatter: { affiliateLink?: unknown; affiliateDisclosure?: unknown }) {
  const hasAffiliateLink = isNonEmptyString(frontmatter.affiliateLink);
  const hasAffiliateDisclosure = isNonEmptyString(frontmatter.affiliateDisclosure);

  assert(
    hasAffiliateLink === hasAffiliateDisclosure,
    'affiliateLink 与 affiliateDisclosure 必须同时存在或同时不存在'
  );
}

function assertSources(
  sources: unknown,
  messagePrefix: string
): asserts sources is { label: string; url: string }[] {
  assert(Array.isArray(sources), `${messagePrefix}: sources 必须为数组`);
  for (const source of sources) {
    assert(isNonEmptyString((source as { label?: unknown }).label), `${messagePrefix}: sources.label 缺失或为空`);
    assert(isNonEmptyString((source as { url?: unknown }).url), `${messagePrefix}: sources.url 缺失或为空`);
  }
}

function assertTutorialCapabilities(frontmatter: ITutorialFrontmatter, fileSlug: string): void {
  assert(Array.isArray(frontmatter.requiredCapabilities), `tutorials/${fileSlug}: requiredCapabilities 必须为数组`);
  for (const capability of frontmatter.requiredCapabilities) {
    assert(
      isNonEmptyString(capability),
      `tutorials/${fileSlug}: requiredCapabilities 存在空值`
    );
    assert(
      Object.prototype.hasOwnProperty.call(TOOL_CAPABILITY_LABEL_ZH, capability),
      `tutorials/${fileSlug}: requiredCapabilities 存在未知能力：${capability}`
    );
  }
}

function assertCompareDimensions(frontmatter: ICompareFrontmatter, fileSlug: string): void {
  assert(Array.isArray(frontmatter.dimensions), `compare/${fileSlug}: dimensions 必须为数组`);
  const present = new Set(frontmatter.dimensions.map((d) => d.dimension));
  const missing = REQUIRED_COMPARE_DIMENSIONS.filter((dimension) => !present.has(dimension));
  assert(
    missing.length === 0,
    `compare/${fileSlug}: dimensions 缺少固定维度：${missing.join('、')}`
  );
}

/**
 * 校验工具 frontmatter 的关键字段（构建期失败优于线上静默错误）。
 */
export function assertToolFrontmatter(frontmatter: IToolFrontmatter, fileSlug: string): void {
  assertSlugMatchesFile(frontmatter.slug, fileSlug);
  assert(isNonEmptyString(frontmatter.title), `tools/${fileSlug}: title 缺失或为空`);
  if (frontmatter.titleZh !== undefined) {
    assert(isNonEmptyString(frontmatter.titleZh), `tools/${fileSlug}: titleZh 为空`);
  }
  if (frontmatter.titleEn !== undefined) {
    assert(isNonEmptyString(frontmatter.titleEn), `tools/${fileSlug}: titleEn 为空`);
  }
  assert(isNonEmptyString(frontmatter.description), `tools/${fileSlug}: description 缺失或为空`);
  assert(Array.isArray(frontmatter.productType), `tools/${fileSlug}: productType 必须为数组`);
  assert(frontmatter.productType.length > 0, `tools/${fileSlug}: productType 不能为空`);
  for (const type of frontmatter.productType) {
    assert(isNonEmptyString(type), `tools/${fileSlug}: productType 存在空值`);
    assert(
      Object.prototype.hasOwnProperty.call(TOOL_PRODUCT_TYPE_LABEL_ZH, type),
      `tools/${fileSlug}: productType 存在未知类型：${type}`
    );
  }
  assert(isIsoDateString(frontmatter.updatedAt), `tools/${fileSlug}: updatedAt 不是有效日期`);
  assert(isNonEmptyString(frontmatter.version), `tools/${fileSlug}: version 缺失或为空`);
  assert(Array.isArray(frontmatter.keywords), `tools/${fileSlug}: keywords 必须为数组`);
  assertAffiliateDisclosure(frontmatter);

  if (frontmatter.purchase?.updatedAt !== undefined) {
    assert(isIsoDateString(frontmatter.purchase.updatedAt), `tools/${fileSlug}: purchase.updatedAt 不是有效日期`);
  }
  if (frontmatter.purchase?.sources !== undefined) {
    assertSources(frontmatter.purchase.sources, `tools/${fileSlug}: purchase`);
  }
  if (frontmatter.privacy?.updatedAt !== undefined) {
    assert(isIsoDateString(frontmatter.privacy.updatedAt), `tools/${fileSlug}: privacy.updatedAt 不是有效日期`);
  }
}

/**
 * 校验对比 frontmatter 的关键字段。
 */
export function assertCompareFrontmatter(frontmatter: ICompareFrontmatter, fileSlug: string): void {
  assertSlugMatchesFile(frontmatter.slug, fileSlug);
  assert(isNonEmptyString(frontmatter.title), `compare/${fileSlug}: title 缺失或为空`);
  assert(isNonEmptyString(frontmatter.description), `compare/${fileSlug}: description 缺失或为空`);
  assert(isIsoDateString(frontmatter.updatedAt), `compare/${fileSlug}: updatedAt 不是有效日期`);
  assert(Array.isArray(frontmatter.keywords), `compare/${fileSlug}: keywords 必须为数组`);
  assertCompareDimensions(frontmatter, fileSlug);
  if (frontmatter.riskAnalysis?.updatedAt !== undefined) {
    assert(isIsoDateString(frontmatter.riskAnalysis.updatedAt), `compare/${fileSlug}: riskAnalysis.updatedAt 不是有效日期`);
  }
  if (frontmatter.riskAnalysis?.sources !== undefined) {
    assertSources(frontmatter.riskAnalysis.sources, `compare/${fileSlug}: riskAnalysis`);
  }
}

/**
 * 校验教程 frontmatter 的关键字段。
 */
export function assertTutorialFrontmatter(frontmatter: ITutorialFrontmatter, fileSlug: string): void {
  assertSlugMatchesFile(frontmatter.slug, fileSlug);
  assert(isNonEmptyString(frontmatter.title), `tutorials/${fileSlug}: title 缺失或为空`);
  assert(isNonEmptyString(frontmatter.description), `tutorials/${fileSlug}: description 缺失或为空`);
  assert(isIsoDateString(frontmatter.updatedAt), `tutorials/${fileSlug}: updatedAt 不是有效日期`);
  assert(Array.isArray(frontmatter.keywords), `tutorials/${fileSlug}: keywords 必须为数组`);
  assertTutorialCapabilities(frontmatter, fileSlug);
  if (frontmatter.safety?.updatedAt !== undefined) {
    assert(isIsoDateString(frontmatter.safety.updatedAt), `tutorials/${fileSlug}: safety.updatedAt 不是有效日期`);
  }
  if (frontmatter.safety?.sources !== undefined) {
    assertSources(frontmatter.safety.sources, `tutorials/${fileSlug}: safety`);
  }
}

/**
 * 校验模板 frontmatter 的关键字段。
 */
export function assertTemplateFrontmatter(frontmatter: ITemplateFrontmatter, fileSlug: string): void {
  assertSlugMatchesFile(frontmatter.slug, fileSlug);
  assert(isNonEmptyString(frontmatter.title), `templates/${fileSlug}: title 缺失或为空`);
  assert(isNonEmptyString(frontmatter.description), `templates/${fileSlug}: description 缺失或为空`);
  assert(isIsoDateString(frontmatter.updatedAt), `templates/${fileSlug}: updatedAt 不是有效日期`);
  assertStringArray(frontmatter.keywords, `templates/${fileSlug}: keywords`, { allowEmpty: false });
  assert(isNonEmptyString(frontmatter.template), `templates/${fileSlug}: template 缺失或为空`);
  assertStringArray(frontmatter.applicableTools, `templates/${fileSlug}: applicableTools`);
  assertStringArray(frontmatter.scenarios, `templates/${fileSlug}: scenarios`, { allowEmpty: false, minLength: 1, maxLength: 2 });
  assertStringArray(frontmatter.placeholders, `templates/${fileSlug}: placeholders`);
  assertStringArray(frontmatter.dependencies, `templates/${fileSlug}: dependencies`);
  assert(isNonEmptyString(frontmatter.example), `templates/${fileSlug}: example 缺失或为空`);
}
