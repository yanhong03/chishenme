# 饭点盲盒 (Lunch Blind Box)

这是一个基于 React + Express + Supabase 的饭点盲盒应用。

## 部署到 Vercel 指南

1. **托管到 GitHub**:
   - 在 GitHub 上创建一个新的仓库。
   - 将此项目推送到 GitHub 仓库。

2. **在 Vercel 上部署**:
   - 登录 [Vercel](https://vercel.com/)。
   - 点击 "Add New" -> "Project"。
   - 导入您的 GitHub 仓库。
   - **配置环境变量**:
     - 在 "Environment Variables" 部分，添加以下变量：
       - `SUPABASE_URL`: 您的 Supabase 项目 URL。
       - `SUPABASE_ANON_KEY`: 您的 Supabase 匿名 Key。
   - 点击 "Deploy"。

3. **配置 Supabase**:
   - 确保您的 Supabase 数据库已根据 `supabase-schema.sql` 完成初始化。

## 本地开发

1. 安装依赖: `npm install`
2. 启动开发服务器: `npm run dev`
