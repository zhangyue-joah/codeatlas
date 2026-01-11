'use client';

import { useMemo, useState } from 'react';
import type { ITemplateFrontmatter, TLanguage, TTemplateType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton';
import { PillMultiSelect, type TPillMultiSelectOption } from '@/components/ui/PillMultiSelect';
import { cn, formatDate } from '@/lib/utils';
import { t } from '@/i18n/messages';

type TConfigTab = 'prompts' | 'mcp' | 'skills';
type TConfigItemType = 'Prompt' | 'MCP' | 'Skill';

export type TRulesConfigTemplateItem = {
  slug: string;
  frontmatter: ITemplateFrontmatter;
};

interface IRulesConfigPageClientProps {
  language: TLanguage;
  items: TRulesConfigTemplateItem[];
  initialQuery?: string;
  initialTab?: TConfigTab;
}

type TExportItem = {
  name: string;
  type: TConfigItemType;
  description: string;
  scenarios: string[];
  updatedAt: string;
  placeholders: string[];
  dependencies: string[];
  config: string;
  example: string;
};

function getConfigTab(templateType: TTemplateType): TConfigTab {
  if (templateType === 'prompt-recipe') return 'prompts';
  if (templateType === 'mcp-config') return 'mcp';
  return 'skills';
}

function getConfigItemType(templateType: TTemplateType): TConfigItemType {
  const tab = getConfigTab(templateType);
  if (tab === 'prompts') return 'Prompt';
  if (tab === 'mcp') return 'MCP';
  return 'Skill';
}

function uniqSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function normalizeText(value: string) {
  return value.replace(/\r\n/g, '\n');
}

function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function yamlScalar(value: string) {
  return JSON.stringify(value);
}

function yamlBlock(value: string, indent: number) {
  const normalized = normalizeText(value).trimEnd();
  const pad = ' '.repeat(indent);
  const lines = normalized.split('\n');
  return ['|', ...lines.map((line) => `${pad}${line}`)].join('\n');
}

function toYaml(items: TExportItem[]) {
  const lines: string[] = ['items:'];

  for (const item of items) {
    lines.push(`  - name: ${yamlScalar(item.name)}`);
    lines.push(`    type: ${yamlScalar(item.type)}`);
    lines.push(`    description: ${yamlScalar(item.description)}`);

    lines.push('    scenarios:');
    for (const scenario of item.scenarios) {
      lines.push(`      - ${yamlScalar(scenario)}`);
    }

    lines.push(`    updatedAt: ${yamlScalar(item.updatedAt)}`);

    if (item.placeholders.length === 0) {
      lines.push('    placeholders: []');
    } else {
      lines.push('    placeholders:');
      for (const placeholder of item.placeholders) {
        lines.push(`      - ${yamlScalar(placeholder)}`);
      }
    }

    if (item.dependencies.length === 0) {
      lines.push('    dependencies: []');
    } else {
      lines.push('    dependencies:');
      for (const dependency of item.dependencies) {
        lines.push(`      - ${yamlScalar(dependency)}`);
      }
    }

    lines.push(`    config: ${yamlBlock(item.config, 6)}`);
    lines.push(`    example: ${yamlBlock(item.example, 6)}`);
  }

  return `${lines.join('\n')}\n`;
}

function toMarkdown(items: TExportItem[], language: TLanguage) {
  const isZh = language !== 'en';
  const blocks: string[] = [];

  for (const item of items) {
    const replaceText =
      item.placeholders.length > 0
        ? isZh
          ? `是：${item.placeholders.join(', ')}`
          : `Yes: ${item.placeholders.join(', ')}`
        : isZh
          ? '否'
          : 'No';
    const depsText = item.dependencies.length > 0 ? item.dependencies.join(isZh ? '；' : '; ') : isZh ? '无' : 'None';

    blocks.push(
      [
        `## ${item.name}`,
        '',
        `- ${isZh ? '类型' : 'Type'}：${item.type}`,
        `- ${isZh ? '用途' : 'Purpose'}：${item.description}`,
        `- ${isZh ? '场景' : 'Use cases'}：${item.scenarios.join(' / ')}`,
        `- ${isZh ? '更新时间' : 'Updated'}：${item.updatedAt}`,
        `- ${isZh ? '需要替换变量' : 'Replace variables'}：${replaceText}`,
        `- ${isZh ? '依赖' : 'Dependencies'}：${depsText}`,
        '',
        `### ${isZh ? '配置主体' : 'Config'}`,
        '```',
        normalizeText(item.config).trimEnd(),
        '```',
        '',
        `### ${isZh ? '使用示例' : 'Example'}`,
        '```',
        normalizeText(item.example).trimEnd(),
        '```',
      ].join('\n')
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

export function RulesConfigPageClient({ language, items, initialQuery, initialTab }: IRulesConfigPageClientProps) {
  const [tab, setTab] = useState<TConfigTab>(initialTab ?? 'prompts');
  const [query, setQuery] = useState(initialQuery ?? '');
  const [scenarios, setScenarios] = useState<string[]>([]);

  const tabbedItems = useMemo(() => items.filter((item) => getConfigTab(item.frontmatter.type) === tab), [items, tab]);

  const scenarioOptions = useMemo<TPillMultiSelectOption[]>(() => {
    const values = tabbedItems.flatMap((item) => item.frontmatter.scenarios);
    return uniqSorted(values).map((value) => ({ value, label: value }));
  }, [tabbedItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tabbedItems.filter((item) => {
      const fm = item.frontmatter;
      if (scenarios.length > 0 && !scenarios.some((s) => fm.scenarios.includes(s))) return false;

      if (!q) return true;
      const haystack = [
        fm.title,
        fm.description,
        fm.type,
        fm.template,
        fm.example,
        ...(fm.scenarios ?? []),
        ...(fm.placeholders ?? []),
        ...(fm.dependencies ?? []),
      ]
        .join('\n')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, scenarios, tabbedItems]);

  const exports = useMemo<TExportItem[]>(
    () =>
      filtered.map((item) => {
        const fm = item.frontmatter;
        return {
          name: fm.title,
          type: getConfigItemType(fm.type),
          description: fm.description,
          scenarios: fm.scenarios,
          updatedAt: fm.updatedAt,
          placeholders: fm.placeholders,
          dependencies: fm.dependencies,
          config: fm.template,
          example: fm.example,
        };
      }),
    [filtered]
  );

  const isZh = language !== 'en';
  const tabLabel = (key: TConfigTab) => {
    if (key === 'prompts') return 'Prompts';
    if (key === 'mcp') return 'MCP';
    return 'Skills';
  };

  const copyAllText = useMemo(() => toMarkdown(exports, language), [exports, language]);
  const jsonText = useMemo(() => `${JSON.stringify({ items: exports }, null, 2)}\n`, [exports]);
  const yamlText = useMemo(() => toYaml(exports), [exports]);
  const mdText = copyAllText;

  const fileStamp = new Date().toISOString().slice(0, 10);
  const baseFileName = `rules-config_${tab}_${fileStamp}`;

  const headerActionClassName =
    'inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="text-base font-semibold text-card-foreground">{isZh ? '批量复制 / 导出' : 'Export & copy'}</div>
            <div className="text-sm text-muted-foreground">
              {isZh ? '按当前 Tab / 筛选导出，或一键复制（配置 + 示例）。' : 'Export the current tab/filters, or copy all (config + example).'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyToClipboardButton
              text={copyAllText}
              size="md"
              copyLabel={isZh ? '复制本页全部' : 'Copy all'}
              variant="primary"
            />
            <button
              type="button"
              className={headerActionClassName}
              onClick={() => downloadTextFile(`${baseFileName}.json`, jsonText, 'application/json;charset=utf-8')}
            >
              {isZh ? '下载 JSON' : 'Download JSON'}
            </button>
            <button
              type="button"
              className={headerActionClassName}
              onClick={() => downloadTextFile(`${baseFileName}.yaml`, yamlText, 'text/yaml;charset=utf-8')}
            >
              {isZh ? '下载 YAML' : 'Download YAML'}
            </button>
            <button
              type="button"
              className={headerActionClassName}
              onClick={() => downloadTextFile(`${baseFileName}.md`, mdText, 'text/markdown;charset=utf-8')}
            >
              {isZh ? '下载 MD' : 'Download MD'}
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['prompts', 'mcp', 'skills'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setScenarios([]);
              }}
              aria-pressed={tab === key}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                tab === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tabLabel(key)}
            </button>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          {isZh ? `共 ${filtered.length} 个结果` : `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(language, 'templates.search.placeholder')}
              aria-label={t(language, 'templates.search.placeholder')}
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            {query.trim() ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={isZh ? '清空搜索' : 'Clear search'}
              >
                <ClearIcon />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PillMultiSelect
              label={isZh ? '场景筛选' : 'Use cases'}
              values={scenarios}
              options={scenarioOptions}
              emptyLabel={isZh ? '全部' : 'All'}
              clearLabel={isZh ? '清空' : 'Clear'}
              onChange={setScenarios}
            />
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setScenarios([]);
              }}
              disabled={!query.trim() && scenarios.length === 0}
              className={cn(
                headerActionClassName,
                !query.trim() && scenarios.length === 0 && 'cursor-not-allowed text-muted-foreground opacity-60 hover:bg-background'
              )}
            >
              {isZh ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      <ul role="list" className="space-y-4">
        {filtered.map((item) => (
          <li key={item.slug}>
            <ConfigItemCard language={language} template={item.frontmatter} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfigItemCard({ language, template }: { language: TLanguage; template: ITemplateFrontmatter }) {
  const isZh = language !== 'en';
  const itemType = getConfigItemType(template.type);
  const updatedAtText = isZh ? `更新于：${formatDate(template.updatedAt, language)}` : `Updated: ${formatDate(template.updatedAt, language)}`;

  const needsReplace = template.placeholders.length > 0;
  const replaceText = needsReplace ? (isZh ? `是：${template.placeholders.join(', ')}` : `Yes: ${template.placeholders.join(', ')}`) : isZh ? '否' : 'No';
  const depsText =
    template.dependencies.length > 0 ? template.dependencies.join(isZh ? '；' : '; ') : isZh ? '无' : 'None';

  const combinedText = `${normalizeText(template.template).trimEnd()}\n\n---\n\n${normalizeText(template.example).trimEnd()}\n`;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-tight text-card-foreground sm:text-lg">{template.title}</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">{template.description}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>{itemType}</Badge>
              {template.scenarios.map((tag) => (
                <Badge key={tag} className="bg-muted">
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground">{updatedAtText}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyToClipboardButton
              text={template.template}
              copyLabel={isZh ? '复制配置' : 'Copy config'}
              variant={itemType === 'MCP' ? 'primary' : 'outline'}
            />
            <CopyToClipboardButton text={template.example} copyLabel={isZh ? '复制示例' : 'Copy example'} />
            <CopyToClipboardButton text={combinedText} copyLabel={isZh ? '复制配置 + 示例' : 'Copy both'} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/10 p-4">
          <div className="text-sm font-semibold text-foreground">{isZh ? '使用前说明' : 'Before use'}</div>
          <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <span className="font-medium text-foreground">{isZh ? '需要替换变量：' : 'Replace variables: '}</span>
              {replaceText}
            </div>
            <div>
              <span className="font-medium text-foreground">{isZh ? '依赖：' : 'Dependencies: '}</span>
              {depsText}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock title={isZh ? '配置主体' : 'Config'} content={template.template} />
          <CodeBlock title={isZh ? '使用示例' : 'Example'} content={template.example} />
        </div>
      </div>
    </section>
  );
}

function CodeBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      </div>
      <pre className="max-h-[60vh] overflow-auto p-4 text-sm text-foreground">
        <code>{normalizeText(content)}</code>
      </pre>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
