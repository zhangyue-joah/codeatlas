import { cn } from '@/lib/utils';
import type { ReactNode, MouseEvent } from 'react';

/**
 * Badge 变体类型
 * - default: 默认灰色标签，用于一般信息
 * - primary: 主色调标签，用于分类/能力等重要标签
 * - secondary: 次要标签，用于产品形态等
 * - outline: 边框样式，用于右侧分类标识
 * - success: 成功/免费状态
 * - warning: 警告/热门状态
 */
type TBadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning';

/**
 * Badge 尺寸
 * - sm: 小尺寸，用于元信息
 * - md: 默认尺寸
 */
type TBadgeSize = 'sm' | 'md';

interface IBadgeProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
  title?: string;
  /** 标签变体样式 */
  variant?: TBadgeVariant;
  /** 标签尺寸 */
  size?: TBadgeSize;
}

/** 变体样式映射 */
const variantStyles: Record<TBadgeVariant, string> = {
  default: 'border-border-subtle bg-muted/60 text-foreground/70',
  primary: 'border-primary/25 bg-primary/10 text-primary font-semibold',
  secondary: 'border-border-subtle bg-muted/50 text-foreground/70',
  outline: 'border-border bg-transparent text-muted-foreground',
  success: 'border-success/25 bg-success/10 text-success dark:text-success',
  warning: 'border-warning/25 bg-warning/10 text-warning dark:text-warning',
};

/** 尺寸样式映射 */
const sizeStyles: Record<TBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({
  children,
  className,
  onClick,
  title,
  variant = 'default',
  size = 'md',
}: IBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as MouseEvent<HTMLSpanElement>);
        }
      } : undefined}
    >
      {children}
    </span>
  );
}
