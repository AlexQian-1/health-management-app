# Vercel 部署解决方案

## ✅ 已创建的配置文件

1. **`vercel.json`** - Vercel 路由配置
2. **`api/index.js`** - Serverless 函数入口点
3. **`backend/server.js`** - 已更新，支持 Vercel 环境

## 🚀 部署步骤

### 1. 提交代码到 GitHub

```bash
git add vercel.json api/index.js backend/server.js .gitignore
git commit -m "Add Vercel deployment configuration"
git push
```

### 2. 在 Vercel 上部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New Project"**
3. 导入 GitHub 仓库 `health-management-app`
4. 配置：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

### 3. 配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```
NODE_ENV=production
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=你的JWT密钥（必须更改！）
CORS_ORIGIN=https://your-app.vercel.app
```

### 4. 部署

点击 **Deploy**，等待部署完成。

## ⚠️ 重要提示

1. **MongoDB Atlas**：
   - 确保 MongoDB Atlas 允许所有 IP（0.0.0.0/0）
   - 或添加 Vercel 的 IP 地址

2. **环境变量**：
   - 必须在 Vercel 项目设置中配置
   - 不要提交 `.env` 文件到 GitHub

3. **CORS_ORIGIN**：
   - 设置为你的 Vercel 域名
   - 格式：`https://your-app.vercel.app`

## 🔍 验证部署

部署成功后，访问你的 Vercel 域名：
- 应该能看到登录页面
- API 路由应该正常工作（如 `/api/health`）

## 📝 文件说明

- **`vercel.json`**: 告诉 Vercel 如何处理路由
- **`api/index.js`**: Vercel serverless 函数入口
- **`backend/server.js`**: 检测 Vercel 环境，不监听端口
