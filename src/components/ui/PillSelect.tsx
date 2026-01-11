'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type TPillSelectOption = { value: string; label: string };

interface IPillSelectProps {
  label: string;
  value: string;
  options: TPillSelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

/**
 * 胶囊形下拉（自定义样式）：用于与站内圆角/弱边界体系保持一致。
 * - 支持键盘：Enter/Space 打开，↑↓移动，Enter 选择，Esc 关闭
 */
export function PillSelect({ label, value, options, disabled = false, onChange }: IPillSelectProps) {
  const id = useId();
  const popoverId = `${id}-popover`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const currentLabel = useMemo(
    () => options.find((opt) => opt.value === value)?.label ?? options[0]?.label ?? '',
    [options, value]
  );

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
    const selectedIndex = options.findIndex((opt) => opt.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, options, value]);

  const selectByIndex = (index: number) => {
    const option = options[index];
    if (!option) return;
    close();
    onChange(option.value);
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
        onClick={() => (open ? close() : openWithActive(options.findIndex((opt) => opt.value === value)))}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openWithActive(Math.max(0, options.findIndex((opt) => opt.value === value)));
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open ? close() : openWithActive(Math.max(0, options.findIndex((opt) => opt.value === value)));
          }
        }}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="max-w-[10rem] truncate font-semibold text-foreground">{currentLabel}</span>
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
          className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-modal focus:outline-none"
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
            if (event.key === 'Enter') {
              event.preventDefault();
              selectByIndex(activeIndex);
            }
          }}
        >
          <div className="max-h-[18rem] overflow-auto p-2">
            {options.map((opt, index) => {
              const selected = opt.value === value;
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
                  onClick={() => selectByIndex(index)}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <CheckMiniIcon />}
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
