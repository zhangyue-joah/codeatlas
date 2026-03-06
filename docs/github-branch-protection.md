# GitHub 分支保护建议（CodeAtlas）

## 目标

为 `main` 分支建立最小可用的合并门禁，确保每次上线都经过自动检查与人工审核。

## 建议规则（main）

1. **Require a pull request before merging**：开启  
2. **Required approvals**：至少 `1` 个  
3. **Require review from Code Owners**：开启（依赖 `.github/CODEOWNERS`）  
4. **Dismiss stale pull request approvals when new commits are pushed**：开启  
5. **Require status checks to pass before merging**：开启，至少包含：  
   - `CI / verify`  
   - `Post Deploy Healthcheck / healthcheck`  
6. **Require conversation resolution before merging**：开启  
7. **Do not allow force pushes**：开启  
8. **Do not allow deletions**：开启  

## 一次性配置示例（可选）

如果你希望用 CLI 快速设置，可在仓库根目录执行：

```bash
gh api --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/zhangyue-joah/codeatlas/branches/main/protection \
  -f required_status_checks.strict=true \
  -f required_pull_request_reviews.dismiss_stale_reviews=true \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f required_pull_request_reviews.require_code_owner_reviews=true \
  -f enforce_admins=true \
  -f required_conversation_resolution=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -F required_status_checks.contexts[]='CI / verify' \
  -F required_status_checks.contexts[]='Post Deploy Healthcheck / healthcheck'
```

> 注意：如果你的 GitHub Action Job 名称变更，`contexts` 也要同步更新。
