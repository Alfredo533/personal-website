# Cloudflare 部署（待作者批准）

这是 Astro 纯静态 MVP，暂不需要 SSR adapter、数据库或密钥。

推荐先采用手动部署，避免 push 自动公开尚在预览的页面。作者审阅并明确批准当前 commit 后，可创建 Cloudflare Pages Direct Upload 项目，然后执行：

```sh
npm ci
npm test
npm run build
npx wrangler pages deploy dist --project-name YOUR_CONFIRMED_PROJECT_NAME
```

以上命令仅供获批后使用，本次没有执行。只上传公开网站的 `dist/`，绝不能选择私有工作区为根目录。

若日后作者希望 Git 自动部署，需要新建 Git integration 项目并连接公开 `personal-website` 仓库（Direct Upload 项目不能直接切换为 Git integration）：构建命令 `npm run build`，输出目录 `dist`，Node 24。连接前确认 Cloudflare 的预览部署和生产分支设置，因为 Git 集成可能会在 push 后自动部署。

域名确定后再配置 Astro `site`、canonical、sitemap。尚未设置虚构域名或联系方式。

官方参考：

- [Cloudflare Pages：Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Pages：Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Astro：TypeScript](https://docs.astro.build/en/guides/typescript/)

部署成功后，把实际 URL、commit、时间与作者批准补记到私有发布记录；不能提前声称已上线。
