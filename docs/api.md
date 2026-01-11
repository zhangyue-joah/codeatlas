# API 文档

## `GET /api/search-index`

用途：为全局搜索提供轻量索引数据（工具/对比/教程/模板）。

返回（JSON）：

- `generatedAt`：生成时间（ISO）
- `items[]`：
  - `type`：`tools | compare | tutorials | templates`
  - `slug`：内容 slug
  - `title`：标题
  - `description`：描述
  - `keywords`：关键词
  - `updatedAt`：更新时间（ISO，可为空）
  - `href`：站内链接

缓存建议：可在浏览器侧缓存，打开搜索面板时懒加载一次即可。

