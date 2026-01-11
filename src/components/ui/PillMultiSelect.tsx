'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type TPillMultiSelectOption = { value: string; label: string };

interface IPillMultiSelectProps {
  label: string;
  values: string[];
  options: TPillMultiSelectOption[];
  emptyLabel: string;
  clearLabel?: string;
  /** 最大可选项数量；设为 1 可作为"单选下拉"。 */
  maxSelected?: number;
  disabled?: boolean;
  /** 是否处于激活状态（有选中项），用于增强视觉区分 */
  active?: boolean;
  onChange: (values: string[]) => void;
}

/**
 * 胶囊形多选下拉：用于“多值筛选”场景。
 * - 支持键盘：Enter/Space 打开，↑↓移动，Enter/Space 勾选，Esc 关闭
 */
export function PillMultiSelect({
  label,
  values,
  options,
  emptyLabel,
  clearLabel = 'Clear',
  maxSelected = Number.POSITIVE_INFINITY,
  disabled = false,
  active = false,
  onChange,
}: IPillMultiSelectProps) {
  const id = useId();
  const popoverId = `${id}-popover`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selectedSet = useMemo(() => new Set(values), [values]);

  const summaryLabel = useMemo(() => {
    if (values.length === 0) return emptyLabel;
    const selectedLabels = options.filter((opt) => selectedSet.has(opt.value)).map((opt) => opt.label);
    if (selectedLabels.length === 0) return emptyLabel;
    if (selectedLabels.length === 1) return selectedLabels[0];
    return `${selectedLabels[0]} +${selectedLabels.length - 1}`;
  }, [emptyLabel, options, selectedSet, values.length]);

  const optionIds = useMemo(() => options.map((_, index) => `${id}-opt-${index}`), [id, options]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
    buttonRef.current?.focus();
  };

  const openWithActive = (index: number) => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(Math.max(0, Math.min(options.length - 1, index)));
    queueMicrotask(() => listRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (listRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idToScroll = optionIds[activeIndex];
    if (!idToScroll) return;
    document.getElementById(idToScroll)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open, optionIds]);

  useEffect(() => {
    if (disabled) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open]);

  const toggleByIndex = (index: number) => {
    const option = options[index];
    if (!option) return;
    const next = new Set(values);
    const isSelected = next.has(option.value);

    if (isSelected) {
      next.delete(option.value);
      onChange(Array.from(next));
      if (maxSelected === 1) close();
      return;
    }

    if (maxSelected === 1) {
      onChange([option.value]);
      close();
      return;
    }

    if (Number.isFinite(maxSelected) && next.size >= maxSelected) return;
    next.add(option.value);
    onChange(Array.from(next));
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => (open ? close() : openWithActive(0))}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openWithActive(0);
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open ? close() : openWithActive(0);
          }
        }}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          active
            ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
            : 'border-input bg-background text-foreground hover:bg-muted',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="max-w-[12rem] truncate font-semibold text-foreground">{summaryLabel}</span>
        <ChevronDownIcon className={cn('ml-1 h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id={popoverId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={activeIndex >= 0 ? optionIds[activeIndex] : undefined}
          tabIndex={0}
          ref={listRef}
          className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-modal focus:outline-none"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              close();
              return;
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((prev) => Math.min(options.length - 1, Math.max(0, prev) + 1));
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((prev) => Math.max(0, Math.max(0, prev) - 1));
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleByIndex(activeIndex);
              return;
            }
          }}
        >
          <div className="max-h-[18rem] overflow-auto p-2">
            <div className="mb-1 flex items-center justify-between gap-2 px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">{values.length === 0 ? emptyLabel : `${values.length}`}</span>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onClick={() => onChange([])}
              >
                {clearLabel}
              </button>
            </div>
            {options.map((opt, index) => {
              const selected = selectedSet.has(opt.value);
              const active = index === activeIndex;
              return (
                <div
                  key={`${label}-${opt.value}`}
                  id={optionIds[index]}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleByIndex(index)}
                >
                  <span className="truncate">{opt.label}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center">
                    {selected ? <CheckMiniIcon /> : <EmptyBox />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMiniIcon() {
  return (
    <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyBox() {
  return <span className="h-4 w-4 rounded border border-border" aria-hidden="true" />;
}
