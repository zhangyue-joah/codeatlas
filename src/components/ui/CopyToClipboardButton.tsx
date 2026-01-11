'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/clipboard';
import { useT } from '@/i18n/client';

type TCopyButtonVariant = 'outline' | 'primary';
type TCopyButtonSize = 'sm' | 'md';

interface ICopyToClipboardButtonProps {
  text: string;
  className?: string;
  variant?: TCopyButtonVariant;
  size?: TCopyButtonSize;
  copyLabel?: string;
  copiedLabel?: string;
}

export function CopyToClipboardButton({
  text,
  className,
  variant = 'outline',
  size = 'sm',
  copyLabel,
  copiedLabel,
}: ICopyToClipboardButtonProps) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1200);
  }, [text]);

  const labelCopy = copyLabel ?? t('template.copy.copy');
  const labelCopied = copiedLabel ?? t('template.copy.copied');
  const label = copied ? labelCopied : labelCopy;

  const base =
    'inline-flex items-center justify-center border border-input font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
  const sizeClass = size === 'sm' ? 'h-8 rounded-md px-3 text-sm' : 'h-9 rounded-lg px-4 text-sm';
  const variantClass =
    variant === 'primary'
      ? cn(
          'bg-primary text-primary-foreground shadow-sm transition-opacity',
          copied ? 'opacity-90' : 'hover:opacity-90'
        )
      : cn('bg-background text-foreground hover:bg-accent', copied && 'border-primary text-primary');

  return (
    <button type="button" onClick={onCopy} className={cn(base, sizeClass, variantClass, className)}>
      {label}
    </button>
  );
}

