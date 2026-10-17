# Human 3.0 · Personal Brand Hub

简体中文个人品牌网站。Astro + TypeScript，静态生成，无数据库和后端。

理念：主动设计自己的人生。Growth is not the destination. Freedom to create and explore is.

## 开发

Node 24 LTS（`.nvmrc`），npm：

```sh
npm ci
npm test
npm run build
npm run dev
```

开发默认地址 `http://127.0.0.1:4321/`。生产输出 `dist/`；`npm run preview` 可预览 build。

## 页面与内容

- `/`：理念、简介、三个 Pillars、最近文章与精选项目。
- `/writing/`：文章索引；`/writing/category/wealth/`、`health/`、`philosophy/`：分类。
- `/writing/[id]/`：Markdown 详情，日期、摘要、分类和标签。
- `/projects/`：三个长期实践／探索项目。
- `/about/`：理念、数字营销背景、兴趣与联系方式占位。
- `/404.html`：未找到页面。

当前没有作者文章被导入。`format-preview.md` 是明确标注的排版占位，不进入最新文章或分类列表。职业详情与联系方式待作者补充。

文章放在 `src/content/writing/`。只接收已经过作者明确批准的正文与公开元数据。公开检查会拒绝未批准文章和摘要不匹配的修改。审批记录应保存在独立的私有工作区，不进入本仓库。

## 质量检查

`npm run build` 依次执行公开内容检查、`astro check`、静态构建和完整站内链接／锚点检查。`npm test` 检查批准边界。常见凭据扫描是辅助检查，提交前仍需审阅 diff。

## 部署

本项目没有自动部署。先提供本地预览，等待作者批准特定版本，再参考 [Cloudflare 部署说明](docs/cloudflare.md)。GitHub 源码 push 不代表网站已部署。
