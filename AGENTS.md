# Public Website Development Rules

此目录是独立 PUBLIC 仓库。上级私有工作区不得提交至本仓库。

- Astro + TypeScript，静态站点，优先少依赖和可迁移的 Markdown。
- 简体中文为主。四个主页面为 Home / Writing / Projects / About。
- 公开文案只使用作者明确批准的材料。缺少事实时用标明的占位内容，不编造文章、身份、成就、联系方式或商业成果。
- AI 第二收入与个人成长系统属于探索项目，不能描述为已验证产品或收入。
- 不导入私人背景、日记、草稿、财务或健康信息；不读取上级目录作为 Astro collection 或 public 资源。
- 私有文章的选择、作者批准记录与转换在私有工作区完成。这里只存批准的公开元数据及 Final Article，不存源路径或审批原话。
- `npm run check:public` 强制检查文章批准摘要、固定占位、私有目录及常见凭据；不能将摘要视为人类授权的替代品。
- `npm test`、`npm run build` 必须通过。build 包含 TypeScript 和站内链接检查。涉及布局时验证手机与桌面；如实报告未执行的检查。
- 原 Final Article 不擅自改写。改变正文或元数据后需要重新审核；不能只重算摘要绕过作者。
- push 与网站部署分别遵循该次作者授权。默认提供本地预览，等待发布批准，不添加自动部署 workflow。
- 不把截图、日志、.env、凭据、node_modules、dist 提交至 Git。
