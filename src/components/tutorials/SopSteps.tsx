import type { ISOPStep } from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { getRequestLanguage } from '@/i18n/server';
import { t } from '@/i18n/messages';

interface ISopStepsProps {
  steps: ISOPStep[];
}

/**
 * SOP 步骤渲染：将结构化 steps 显示为可浏览的步骤卡片，避免只依赖正文。
 */
export function SopSteps({ steps }: ISopStepsProps) {
  if (steps.length === 0) return null;
  const language = getRequestLanguage();

  return (
    <SectionCard id="sop-steps" className="mt-10" title={t(language, 'tutorial.detail.section.sopSteps')}>
      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard key={step.step} step={step} language={language} />
        ))}
      </div>
    </SectionCard>
  );
}

function StepCard({ step, language }: { step: ISOPStep; language: 'zh' | 'en' }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{t(language, 'tutorial.sop.step', { step: step.step })}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{step.title}</div>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>

      {step.code && (
        <pre className="mt-3 overflow-auto rounded-lg border border-border bg-muted p-3 text-sm">
          <code>{step.code}</code>
        </pre>
      )}

      {step.tips && step.tips.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-foreground">{t(language, 'tutorial.sop.tips')}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {step.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {step.warnings && step.warnings.length > 0 && (
        <div className="mt-3 rounded-lg border border-border bg-muted px-3 py-2">
          <div className="text-xs font-semibold text-foreground">{t(language, 'tutorial.sop.warnings')}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {step.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
