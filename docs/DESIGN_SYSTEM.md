# CodeAtlas 设计规范

> **@stable** - 本文档定义了项目的设计规范，修改前请充分评估影响范围。

## 概述

CodeAtlas 采用基于 **Tailwind CSS + CSS 变量** 的设计系统，支持亮色/暗色模式切换。设计风格为现代简约，强调大圆角、分层阴影和温和对比度。

## 文件结构

```
src/
├── styles/
│   └── design-tokens.css    # 设计变量定义（核心）
├── app/
│   └── globals.css          # 全局样式入口
└── tailwind.config.ts       # Tailwind 配置
```

---

## 1. 颜色系统

### 1.1 语义化颜色变量

所有颜色使用 HSL 格式的 CSS 变量，便于主题切换和调整。

| 变量名 | 用途 | 亮色模式 | 暗色模式 |
|--------|------|----------|----------|
| `--background` | 页面背景 | 白色 | 深蓝黑 |
| `--foreground` | 主文字 | 深色 | 浅色 |
| `--primary` | CTA按钮/强调 | 深色 | 浅色 |
| `--secondary` | 次要元素 | 浅灰 | 深灰 |
| `--muted` | 弱化背景 | 浅灰 | 深灰 |
| `--muted-foreground` | 弱化文字 | 中灰 | 中灰 |
| `--accent` | 悬停/选中 | 浅蓝灰 | 深灰 |
| `--destructive` | 危险操作 | 红色 | 暗红 |
| `--border` | 边框 | 浅灰 | 深灰 |
| `--ring` | 焦点环 | 蓝色 | 蓝色 |

### 1.2 功能色

| 变量名 | 用途 | Tailwind 类 |
|--------|------|-------------|
| `--success` | 成功状态 | `text-success`, `bg-success` |
| `--warning` | 警告状态 | `text-warning`, `bg-warning` |
| `--info` | 信息提示 | `text-info`, `bg-info` |

### 1.3 文字颜色层级（统一规范）

**只使用以下 3 级文字颜色：**

| 层级 | Tailwind 类 | 用途 |
|------|-------------|------|
| 主文字 | `text-foreground` | 标题、重要内容 |
| 次要文字 | `text-foreground/70` | 副标题、描述 |
| 弱化文字 | `text-muted-foreground` | 元信息、提示 |

**禁止使用**：`text-foreground/50`, `text-foreground/60`, `text-foreground/65`, `text-foreground/80` 等其他透明度值。

### 1.4 边框颜色层级（统一规范）

**只使用以下 2 级边框颜色：**

| 层级 | Tailwind 类 | 用途 |
|------|-------------|------|
| 标准边框 | `border-border` | 卡片、输入框、分隔线 |
| 弱化边框 | `border-border-subtle` | 图标容器、次要分隔 |

**Ring 边框同理**：
- 标准：`ring-border`
- 弱化：`ring-border-subtle`

**禁止使用**：`border-border/40`, `border-border/50`, `border-border/60`, `border-border/70` 等透明度值。

---

## 2. 字体系统

### 2.1 字体族

```css
--font-body: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial
--font-display: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif
```

- **正文**：使用 `font-sans`（系统无衬线字体）
- **标题**：使用 `font-display`（衬线字体，中文环境回退到无衬线）

### 2.2 字体大小

| Tailwind 类 | 大小 | 用途 |
|-------------|------|------|
| `text-2xs` | 11px | 极小标签（Badge sm） |
| `text-xs` | 12px | 元信息、Footer标题 |
| `text-sm` | 14px | 描述文字、链接 |
| `text-base` | 16px | 正文、卡片标题 |
| `text-lg` | 18px | 小标题、品牌名 |
| `text-xl` | 20px | 页面标题（minimal） |
| `text-2xl` | 24px | 页面标题（compact） |
| `text-3xl` | 30px | 页面标题（default） |
| `text-4xl` | 36px | 首屏大标题 |

### 2.3 字重

| Tailwind 类 | 用途 |
|-------------|------|
| `font-medium` | 标题、强调 |
| `font-semibold` | 品牌名、导航激活态、按钮 |

---

## 3. 间距系统

### 3.1 推荐间距值

| 场景 | 推荐值 | 说明 |
|------|--------|------|
| 卡片内边距 | `p-5 sm:p-6` | 移动端 20px，桌面端 24px |
| 元素间距 | `gap-3` 或 `gap-4` | 12px 或 16px |
| 标签间距 | `gap-2` | 8px |
| 区块间距 | `mt-4` | 16px |
| 页面容器 | `px-4 sm:px-6 lg:px-8` | 响应式水平内边距 |
| 最大宽度 | `max-w-7xl` | 1280px |

### 3.2 响应式断点

| 前缀 | 最小宽度 |
|------|----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## 4. 圆角系统

| Tailwind 类 | 大小 | 用途 |
|-------------|------|------|
| `rounded-sm` | ~10px | 小元素 |
| `rounded-md` | ~12px | 中等元素 |
| `rounded-lg` | ~14px | 默认圆角 |
| `rounded-xl` | 16px | 图标容器 |
| `rounded-2xl` | 16px | 卡片 |
| `rounded-3xl` | 24px | 大面板 |
| `rounded-full` | 9999px | 按钮、Badge |

---

## 5. 阴影系统

| Tailwind 类 | 用途 |
|-------------|------|
| `shadow-sm` | 轻微阴影 |
| `shadow-card` | 卡片默认阴影 |
| `shadow-card-hover` | 卡片悬停阴影 |
| `shadow-toolbar` | 工具栏阴影 |
| `shadow-modal` | 弹窗阴影 |

---

## 6. 组件规范

### 6.1 Badge 组件

**变体**：
- `default` - 默认灰色标签
- `primary` - 主色调标签（分类/能力）
- `secondary` - 次要标签（产品形态）
- `outline` - 边框样式
- `success` - 成功/免费状态
- `warning` - 警告/热门状态

**尺寸**：
- `sm` - 小尺寸（text-2xs）
- `md` - 默认尺寸（text-xs）

### 6.2 卡片组件

**标准卡片样式**：
```tsx
className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:p-6"
```

**图标容器样式**：
```tsx
className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-muted/60"
```

### 6.3 按钮组件

**主按钮**：
```tsx
className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
```

**次要按钮**：
```tsx
className="inline-flex items-center justify-center rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-muted"
```

---

## 7. 主题切换

使用 `next-themes` 库实现主题切换：

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

暗色模式通过 `.dark` 类选择器覆盖 CSS 变量实现。

---

## 8. 工具函数

### 8.1 cn() - 类名合并

```tsx
import { cn } from '@/lib/utils';

// 使用示例
className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className
)}
```

### 8.2 formatDate() - 日期格式化

```tsx
import { formatDate } from '@/lib/utils';

// 使用示例
formatDate('2024-01-15', 'zh-CN') // "2024年1月15日"
formatDate('2024-01-15', 'en')    // "Jan 15, 2024"
```

---

## 9. 最佳实践

### 9.1 DO（推荐）

- 使用语义化的颜色变量（`text-foreground`）而非硬编码颜色
- 使用统一的透明度层级（3级文字、2级边框）
- 使用 `cn()` 函数合并类名
- 使用响应式前缀适配不同屏幕
- 为可交互元素添加 `focus-visible` 样式

### 9.2 DON'T（避免）

- 不要使用硬编码的颜色值（如 `#333`、`rgb()`）
- 不要使用非标准的透明度值（如 `text-foreground/65`）
- 不要使用硬编码的字体大小（如 `text-[11px]`）
- 不要在组件中重复定义相同的样式

---

## 10. 变更日志

| 日期 | 变更内容 |
|------|----------|
| 2025-01-11 | 初始版本：统一颜色、字体、间距、圆角、阴影规范 |
