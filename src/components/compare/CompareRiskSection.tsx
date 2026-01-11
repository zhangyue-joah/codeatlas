import type { ICompareFrontmatter } from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { formatDate } from '@/lib/utils';
import { t } from '@/i18n/messages';

export function CompareRiskSection({
  compare,
  language,
}: {
  compare: ICompareFrontmatter;
  language: 'zh' | 'en';
}) {
  const checklist = resolveRiskChecklist(language, compare);
  const complianceNotes = resolveComplianceNotes(language, compare);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <SectionCard
        id="risk-checklist"
        title={t(language, 'compare.detail.risk.title')}
        description={t(language, 'compare.detail.risk.desc')}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {compare.riskAnalysis?.updatedAt && (
          <div className="mt-3 text-xs text-muted-foreground">
            {t(language, 'compare.detail.risk.checkedAt', { date: formatDate(compare.riskAnalysis.updatedAt, language) })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="compliance-notes"
        title={t(language, 'compare.detail.compliance.title')}
        description={t(language, 'compare.detail.compliance.desc')}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {complianceNotes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {compare.riskAnalysis?.sources && compare.riskAnalysis.sources.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-card-foreground">{t(language, 'compare.detail.sources')}</div>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              {compare.riskAnalysis.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary underline underline-offset-4"
                >
                  {source.label} →
                </a>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function resolveRiskChecklist(language: 'zh' | 'en', compare: ICompareFrontmatter): string[] {
  const configured = compare.riskAnalysis?.checklist?.filter((item) => item.trim().length > 0);
  if (configured && configured.length > 0) return configured;

  const aHiddenCosts = compare.costAnalysis.toolA.hiddenCosts ?? [];
  const bHiddenCosts = compare.costAnalysis.toolB.hiddenCosts ?? [];
  const mergedHiddenCosts = [...aHiddenCosts, ...bHiddenCosts].slice(0, 6);

  if (language === 'en') {
    return [
      'Permission boundaries: what does read-only / read-write / execute mean in practice?',
      'Minimal verification path: can you reliably run at least one of lint/test/build?',
      'Reliability risks: outages/rate limits/quotas that can break the workflow?',
      'Hidden costs: learning/migration/team collaboration/compliance audits?',
      ...mergedHiddenCosts.map((item) => `Hidden cost: ${item}`),
    ];
  }

  return [
    '是否明确权限边界：只读/读写/执行分别对应什么能力？',
    '是否有最小验证路径：lint/test/build 至少一种可稳定跑通？',
    '是否存在稳定性风险：服务波动/限流/配额导致工作流中断？',
    '是否存在隐性成本：学习/迁移/团队协作/合规审计等？',
    ...mergedHiddenCosts.map((item) => `隐性成本：${item}`),
  ];
}

function resolveComplianceNotes(language: 'zh' | 'en', compare: ICompareFrontmatter): string[] {
  const configured = compare.riskAnalysis?.complianceNotes?.filter((item) => item.trim().length > 0);
  if (configured && configured.length > 0) return configured;

  if (language === 'en') {
    return [
      'Prefer official/authorized channels; avoid non-traceable paths (shared accounts/top-ups).',
      'Verify data policy: what is uploaded, retention duration, enterprise compliance terms.',
      'For teams: enable audit and permission governance (who can write/execute, rollback).',
      'Affiliate links must be clearly disclosed; conclusions should be explainable and verifiable.',
    ];
  }

  return [
    '优先官方/授权渠道购买，避免不可追溯路径（代充/共享账号等）。',
    '核对数据策略：哪些数据会上传、保留多久、是否支持企业合规条款。',
    '团队场景建议启用审计/权限治理：谁能写、谁能执行、如何回滚。',
    '推广链接必须明确标注，结论需可解释并基于可复核信息。',
  ];
}

