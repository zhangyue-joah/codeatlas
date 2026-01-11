import { splitHighlightParts } from '@/utils/search';
import { cn } from '@/lib/utils';

interface IHighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightedText({ text, query, className }: IHighlightedTextProps) {
  const parts = splitHighlightParts(text, query);
  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlighted ? (
          <mark key={index} className={cn('rounded bg-primary/15 px-0.5 text-foreground')}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
}

