# Vercel 404 错误修复

## ✅ 已修复的配置

1. **`vercel.json`** - 简化了路由配置，移除了可能导致问题的静态文件路由
2. **`api/index.js`** - 改为导出 handler 函数，这是 Vercel 推荐的方式

## 🚀 部署步骤

### 1. 提交更改

```bash
git add vercel.json api/index.js backend/server.js
git commit -m "Fix Vercel deployment configuration"
git push
```

### 2. 在 Vercel 上重新部署

1. 进入 Vercel 项目
2. 点击 **"Deployments"**
3. 找到最新的部署，点击 **"..."** → **"Redeploy"**
4. 或者等待自动重新部署（如果已连接 GitHub）

### 3. 检查部署日志

部署时查看日志，确保：
- ✅ 构建成功
- ✅ 没有错误信息
- ✅ `api/index.js` 被正确识别

## 🔍 如果仍然出现 404

### 检查清单

1. **确认文件存在**：
   - ✅ `vercel.json` 在项目根目录
   - ✅ `api/index.js` 存在
   - ✅ `backend/server.js` 存在

2. **检查 Vercel 项目设置**：
   - Root Directory: `./` (根目录)
   - Build Command: 留空
   - Output Directory: 留空
   - Install Command: `npm install`

3. **检查环境变量**：
   - `NODE_ENV=production`
   - `MONGODB_URI=你的连接字符串`
   - `JWT_SECRET=你的密钥`
   - `CORS_ORIGIN=https://your-app.vercel.app`

4. **测试 API**：
   - 访问 `https://your-app.vercel.app/api/health`
   - 应该返回 JSON: `{"success":true,"message":"Server is running normally"}`

## 🆘 如果问题仍然存在

请提供：
1. Vercel 部署日志的完整错误信息
2. 访问的具体 URL
3. 浏览器控制台的错误信息

## 📝 关键配置说明

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
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### api/index.js
```javascript
const app = require('../backend/server');
module.exports = (req, res) => {
    return app(req, res);
};
```

这个配置应该能解决 404 问题。
