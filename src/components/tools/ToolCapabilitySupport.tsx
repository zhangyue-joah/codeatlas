import type {
  IExternalSystemIntegration,
  IMcpServerExample,
  IToolFrontmatter,
  TLanguage,
  TPermissionLevel,
  TToolCapability,
} from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { Badge } from '@/components/ui/Badge';
import { t } from '@/i18n/messages';
import { getToolCapabilityLabel } from '@/i18n/labels';

interface IToolCapabilitySupportProps {
  tool: IToolFrontmatter;
  language: TLanguage;
  id?: string;
  className?: string;
}

/**
 * 工具详情页“能力支持”区块：按 PRD 固定维度结构化展示，减少用户心智负担。
 */
export function ToolCapabilitySupport({
  tool,
  language,
  id: toolCapabilityId,
  className: toolCapabilityClassName,
}: IToolCapabilitySupportProps) {
  const permission = derivePermissionLevel(tool.capabilities);

  const rows = [
    { capability: 'repo-context' as const, enabled: hasCapability(tool, 'repo-context') },
    { capability: 'agent-execution' as const, enabled: hasCapability(tool, 'agent-execution') },
    { capability: 'mcp-server' as const, enabled: hasCapability(tool, 'mcp-server') },
    { capability: 'skills-plugins' as const, enabled: hasCapability(tool, 'skills-plugins') },
    { capability: 'local-command' as const, enabled: hasCapability(tool, 'local-command') },
    { capability: 'external-system' as const, enabled: hasCapability(tool, 'external-system') },
  ];

  return (
    <SectionCard
      id={toolCapabilityId}
      title={t(language, 'tool.capability.title')}
      description={t(language, 'tool.capability.desc')}
      className={toolCapabilityClassName}
    >
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.capability')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.support')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.capability} className="border-b border-border">
                <td className="px-3 py-3 text-foreground">{getToolCapabilityLabel(language, row.capability)}</td>
                <td className="px-3 py-3">
                  <SupportBadge enabled={row.enabled} language={language} />
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {row.enabled ? t(language, 'common.supported') : t(language, 'common.notSupported')}
                </td>
              </tr>
            ))}
            <tr className="border-b border-border">
              <td className="px-3 py-3 text-foreground">{t(language, 'tool.capability.permissionLevel')}</td>
              <td className="px-3 py-3">
                <Badge className="bg-muted">{formatPermission(language, permission)}</Badge>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{t(language, 'tool.capability.permissionHint')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {tool.externalSystems && tool.externalSystems.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.capability.externalSystems')}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tool.externalSystems.map((system) => (
              <Badge key={system} className="bg-muted">
                {system}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tool.externalSystemIntegrations && tool.externalSystemIntegrations.length > 0 && (
        <ExternalIntegrationTable integrations={tool.externalSystemIntegrations} language={language} />
      )}

      {tool.mcpServers && tool.mcpServers.length > 0 && <McpServersBadges servers={tool.mcpServers} language={language} />}
      {tool.mcpServerExamples && tool.mcpServerExamples.length > 0 && <McpServersTable servers={tool.mcpServerExamples} language={language} />}
    </SectionCard>
  );
}

function hasCapability(tool: IToolFrontmatter, capability: TToolCapability): boolean {
  return tool.capabilities.includes(capability);
}

function derivePermissionLevel(capabilities: TToolCapability[]): TPermissionLevel {
  if (capabilities.includes('execute')) return 'execute';
  if (capabilities.includes('read-write')) return 'read-write';
  if (capabilities.includes('read-only')) return 'read-only';
  return 'unknown';
}

function formatPermission(language: TLanguage, level: TPermissionLevel): string {
  switch (level) {
    case 'read-only':
      return getToolCapabilityLabel(language, 'read-only');
    case 'read-write':
      return getToolCapabilityLabel(language, 'read-write');
    case 'execute':
      return getToolCapabilityLabel(language, 'execute');
    default:
      return t(language, 'common.unknown');
  }
}

function SupportBadge({ enabled, language }: { enabled: boolean; language: TLanguage }) {
  return (
    <Badge className={enabled ? 'bg-secondary' : 'bg-muted'}>
      {enabled ? t(language, 'common.supported') : t(language, 'common.notSupported')}
    </Badge>
  );
}

function ExternalIntegrationTable({ integrations, language }: { integrations: IExternalSystemIntegration[]; language: TLanguage }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.capability.externalSystemsDetail')}</div>
      <div className="mt-2 overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.system')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.permission')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.name} className="border-b border-border">
                <td className="px-3 py-3 text-foreground">{renderIntegrationName(integration)}</td>
                <td className="px-3 py-3">
                  <Badge className="bg-muted">{formatPermission(language, integration.permission ?? 'unknown')}</Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{integration.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderIntegrationName(integration: IExternalSystemIntegration) {
  if (!integration.url) return integration.name;
  return (
    <a className="text-primary underline underline-offset-4" href={integration.url} target="_blank" rel="noreferrer noopener">
      {integration.name}
    </a>
  );
}

function McpServersBadges({ servers, language }: { servers: string[]; language: TLanguage }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.capability.mcpExamples')}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {servers.map((server) => (
          <Badge key={server} className="bg-muted">
            {server}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function McpServersTable({ servers, language }: { servers: IMcpServerExample[]; language: TLanguage }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-card-foreground">{t(language, 'tool.capability.mcpDetail')}</div>
      <div className="mt-2 overflow-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.name')}</th>
              <th className="px-3 py-2 font-semibold text-foreground">{t(language, 'tool.capability.table.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server) => (
              <tr key={server.name} className="border-b border-border">
                <td className="px-3 py-3 text-foreground">{renderMcpServerName(server)}</td>
                <td className="px-3 py-3 text-muted-foreground">{server.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderMcpServerName(server: IMcpServerExample) {
  if (!server.url) return server.name;
  return (
    <a className="text-primary underline underline-offset-4" href={server.url} target="_blank" rel="noreferrer noopener">
      {server.name}
    </a>
  );
}
