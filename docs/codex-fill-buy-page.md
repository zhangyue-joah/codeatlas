# 一键填充购买页（Buy）

目标：把 `/buy` 的「产品清单」与「渠道/中转（合规优先）」一次性填满，并在本地 `next build` 校验。

## 一键执行（推荐）

```bash
bash scripts/fill-buy-page.sh
```

这会做两件事：

1. 生成/覆盖工具条目：`node scripts/seed-buy-content.mjs --write --force`
2. 补全购买信息来源（可追溯）：`node scripts/normalize-tools.mjs --write`
3. 本地构建校验：`npm run build`

## 只更新内容（不构建）

```bash
node scripts/seed-buy-content.mjs --write --force
node scripts/normalize-tools.mjs --write
```

## 数据源与维护位置

- 工具条目生成器：`scripts/seed-buy-content.mjs`
- 渠道/中转清单（手工维护）：`src/lib/buy/channels.ts`

## 参考（用于扩展清单）

- GitHub：`coderaptorai/awesome-ai-coding`（工具/项目清单）
  - https://github.com/coderaptorai/awesome-ai-coding
