# 自动化运维说明（GitHub + Vercel）

## 已启用自动化

- `CI`：每次 `push/pull_request` 执行 `npm ci + lint + build`
- `Post Deploy Healthcheck`：CI 成功后执行生产健康检查
- `Scheduled Production Healthcheck`：每 6 小时巡检生产可用性
- `Dependabot`：每周自动更新 npm 与 GitHub Actions 依赖

## 必需配置

- 仓库 Variables:
  - `PRODUCTION_BASE_URL`：生产站点 URL（例如 `https://codeatlas-dusky.vercel.app`）

## 告警机制

- 定时巡检失败时会自动创建（或追加）Issue：
  - 标题：`生产健康检查失败（自动告警）`
- 告警内容会包含失败明细（路径、状态码、耗时、重试次数、失败原因），便于直接定位
- 同时工作流会标记失败，便于在 Actions 中快速定位
- 每次巡检会上传 `scheduled-healthcheck-report` artifact，支持回溯细节

## 建议巡检口径

- 健康检查路径：`/`, `/robots.txt`, `/sitemap.xml`
- 通过条件：
  - HTTP 2xx
  - 响应耗时 <= 4000ms
- 失败重试：
  - 重试 4 次
  - 每次间隔 8 秒

## 手动应急检查

```bash
npm run healthcheck:post-deploy -- https://your-production-url
```

若失败，请优先排查：

1. Vercel 最新部署状态与函数日志
2. 最近合并的 PR 变更范围（尤其路由和配置）
3. 外部依赖（API、DNS、CDN）可用性
