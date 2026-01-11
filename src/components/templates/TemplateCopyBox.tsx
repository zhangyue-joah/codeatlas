import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton';
import { tServer } from '@/i18n/server';

interface ITemplateCopyBoxProps {
  template: string;
}

/**
 * 模板内容 + 一键复制。
 */
export function TemplateCopyBox({ template }: ITemplateCopyBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-card-foreground">{tServer('template.copy.title')}</h3>
        <CopyToClipboardButton text={template} />
      </div>
      <pre className="max-h-[60vh] overflow-auto p-4 text-sm text-foreground">
        <code>{template}</code>
      </pre>
    </div>
  );
}
