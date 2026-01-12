# Vercel 部署问题排查指南

## 🔍 常见问题

### 1. 404 Not Found 错误

**可能原因**：
- `vercel.json` 配置不正确
- `api/index.js` 导出方式错误
- 路径解析问题

**解决方案**：
1. 检查 `vercel.json` 文件是否存在且配置正确
2. 确保 `api/index.js` 正确导出 Express app
3. 检查 Vercel 部署日志中的错误信息

### 2. 静态文件无法加载

**可能原因**：
- `__dirname` 在 serverless 环境中路径不同
- 静态文件路径配置错误

**解决方案**：
- 使用绝对路径
- 检查 `express.static` 配置

### 3. API 请求失败

**可能原因**：
- CORS 配置问题
- API 路由未正确配置
- 环境变量未设置

**解决方案**：
- 检查 CORS_ORIGIN 环境变量
- 确保所有 API 路由都正确注册
- 检查 MongoDB 连接

### 4. 前端页面空白

**可能原因**：
- JavaScript 模块加载失败
- 路径问题
- 控制台错误

**解决方案**：
- 打开浏览器开发者工具查看错误
- 检查网络请求是否成功
- 验证静态文件路径

## 📋 检查清单

- [ ] `vercel.json` 文件存在且配置正确
- [ ] `api/index.js` 文件存在且正确导出
- [ ] 环境变量已配置（MONGODB_URI, JWT_SECRET, CORS_ORIGIN）
- [ ] MongoDB Atlas IP 白名单已配置
- [ ] 代码已推送到 GitHub
- [ ] Vercel 已连接到 GitHub 仓库
- [ ] 部署日志中没有错误

## 🔧 调试步骤

1. **查看 Vercel 部署日志**：
   - 进入 Vercel 项目
   - 点击 "Deployments"
   - 查看最新的部署日志

2. **检查浏览器控制台**：
   - 打开开发者工具（F12）
   - 查看 Console 和 Network 标签
   - 记录任何错误信息

3. **测试 API 端点**：
   - 访问 `https://your-app.vercel.app/api/health`
   - 应该返回 `{"success":true,"message":"Server is running normally"}`

4. **检查环境变量**：
   - 在 Vercel 项目设置中验证所有环境变量
   - 确保格式正确（没有多余空格）

## 🆘 获取帮助

如果问题仍然存在，请提供：
1. Vercel 部署日志的错误信息
2. 浏览器控制台的错误信息
3. 具体的错误页面截图
4. 访问的 URL
