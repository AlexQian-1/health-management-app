# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 准备工作

1. 确保代码已推送到 GitHub
2. 在 [Vercel](https://vercel.com) 注册/登录账号
3. 连接你的 GitHub 账号

### 2. 在 Vercel 上创建项目

1. 点击 **Add New Project**
2. 选择你的 GitHub 仓库 `health-management-app`
3. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `./` (根目录)
   - **Build Command**: 留空（Vercel 会自动检测）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NODE_ENV=production
PORT=3001
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=你的JWT密钥（生产环境必须更改！）
CORS_ORIGIN=https://your-domain.vercel.app
```

**重要**：
- `MONGODB_URI`: 使用 MongoDB Atlas 连接字符串
- `JWT_SECRET`: 使用强随机密钥（不要使用默认值）
- `CORS_ORIGIN`: 设置为你的 Vercel 域名

### 4. 部署

点击 **Deploy**，Vercel 会自动：
- 安装依赖
- 构建项目
- 部署到全球 CDN

## 📁 项目结构

Vercel 会自动识别以下结构：

```
project-root/
├── api/
│   └── index.js          # Vercel serverless 入口
├── backend/
│   └── server.js         # Express 服务器
├── frontend/            # 前端静态文件
├── vercel.json          # Vercel 配置
└── package.json
```

## ⚙️ Vercel 配置说明

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

- **builds**: 指定使用 Node.js runtime
- **routes**: 
  - `/api/*` 路由到 API 处理
  - 其他路由返回前端 HTML（SPA 支持）

## 🔧 常见问题

### 1. 404 错误

**原因**：路由配置不正确

**解决方案**：
- 确保 `vercel.json` 文件存在且配置正确
- 确保 `api/index.js` 文件存在
- 检查 Vercel 部署日志

### 2. MongoDB 连接失败

**原因**：环境变量未设置或 MongoDB Atlas IP 白名单

**解决方案**：
- 在 Vercel 项目设置中添加 `MONGODB_URI`
- 在 MongoDB Atlas 中添加 Vercel 的 IP（或使用 0.0.0.0/0 允许所有 IP）

### 3. CORS 错误

**原因**：`CORS_ORIGIN` 未正确配置

**解决方案**：
- 在 Vercel 环境变量中设置 `CORS_ORIGIN` 为你的 Vercel 域名
- 格式：`https://your-app.vercel.app`

### 4. 静态文件无法加载

**原因**：路径配置问题

**解决方案**：
- 确保 `backend/server.js` 中的静态文件路径正确
- 检查 `express.static` 配置

## 📝 部署后检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] MongoDB Atlas 已配置 IP 白名单
- [ ] 部署成功
- [ ] 前端页面可以访问
- [ ] API 路由正常工作
- [ ] 登录/注册功能正常

## 🔄 更新部署

每次推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署。

也可以手动触发：
1. 进入 Vercel 项目
2. 点击 **Deployments**
3. 点击 **Redeploy**

## 🌐 自定义域名

1. 在 Vercel 项目设置中选择 **Domains**
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Node.js 支持](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
