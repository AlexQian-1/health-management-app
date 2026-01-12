# GitHub 部署指南

## 📋 部署步骤

### 1. 在 GitHub 上创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 **+** 按钮，选择 **New repository**
3. 填写仓库信息：
   - **Repository name**: `health-management-app` (或你喜欢的名字)
   - **Description**: `Personal Health Management Application - CS602 Final Project`
   - **Visibility**: 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 **Create repository**

### 2. 连接本地仓库到 GitHub

在终端中运行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/health-management-app.git

# 或者使用 SSH（如果你配置了 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/health-management-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 验证部署

访问你的 GitHub 仓库页面，应该能看到所有文件都已上传。

## 🔒 重要安全提示

### 环境变量保护

**重要**：`.env` 文件已经在 `.gitignore` 中，不会被提交到 GitHub。

但是，请确保：

1. ✅ **检查 `.env` 文件没有被提交**：
   ```bash
   git ls-files | grep .env
   ```
   如果没有任何输出，说明 `.env` 文件安全。

2. ✅ **使用 `env.example` 作为模板**：
   - `env.example` 已经提交到仓库
   - 其他开发者可以参考这个文件创建自己的 `.env`

3. ✅ **不要在代码中硬编码敏感信息**：
   - JWT_SECRET
   - MongoDB URI（包含密码）
   - API keys

### 如果意外提交了敏感信息

如果 `.env` 文件被意外提交：

```bash
# 从 Git 历史中删除文件
git rm --cached .env
git commit -m "Remove .env file"
git push

# 然后立即在 GitHub 上更改所有密码和密钥
```

## 📝 后续更新

每次更新代码后，使用以下命令推送到 GitHub：

```bash
# 查看更改
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push
```

## 🌐 可选：GitHub Pages 部署（仅前端）

如果你想部署前端到 GitHub Pages：

1. 在仓库设置中启用 GitHub Pages
2. 选择 `frontend` 文件夹作为源
3. 注意：需要修改 API 基础 URL 以支持跨域

## 📚 其他部署选项

### Vercel / Netlify（全栈）
- 支持 Node.js 后端
- 自动部署
- 免费计划可用

### Heroku（后端）
- 支持 Node.js 应用
- 需要配置 MongoDB Atlas

### Railway / Render（全栈）
- 简单易用
- 支持 MongoDB

## ✅ 部署检查清单

- [x] `.gitignore` 已配置
- [x] `.env` 文件不会被提交
- [x] `env.example` 已创建
- [x] 代码已提交到本地仓库
- [ ] 已在 GitHub 创建仓库
- [ ] 已连接远程仓库
- [ ] 代码已推送到 GitHub
- [ ] 验证文件已正确上传

## 🆘 常见问题

### Q: 如何查看远程仓库地址？
```bash
git remote -v
```

### Q: 如何更改远程仓库地址？
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/NEW_REPO_NAME.git
```

### Q: 如何克隆仓库？
```bash
git clone https://github.com/YOUR_USERNAME/health-management-app.git
cd health-management-app
npm install
cp env.example .env
# 然后编辑 .env 文件
```
