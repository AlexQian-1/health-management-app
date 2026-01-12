# Personal Health Management Application

CS602 Final Project - A comprehensive personal health management web application.

## Features

- **User Authentication**: Secure login and registration system with JWT tokens
- **Multi-user Support**: Each user has isolated data with user-specific records
- Dashboard with health data overview
- Diet, Exercise, Sleep, and Weight tracking
- Health Goals management
- Statistics and data visualization
- Profile management

## Tech Stack

- **Frontend**: HTML/CSS/JavaScript (ES6 Modules)
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (本地安装或 MongoDB Atlas)

### 本地开发设置

```bash
# 安装依赖
npm install

# 启动 MongoDB (如果本地运行)
mongod

# 启动服务器
npm start

# 或开发模式（自动重载）
npm run dev
```

### 环境变量配置

创建 `.env` 文件（参考 `env.example`）：

```bash
# 服务器配置
PORT=3001
NODE_ENV=development

# MongoDB 数据库连接
# 本地: mongodb://localhost:27017/healthapp
# MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/healthapp
MONGODB_URI=mongodb://localhost:27017/healthapp

# JWT密钥（生产环境必须更改！）
# 生成随机密钥: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-change-in-production

# CORS 配置（可选，多个用逗号分隔）
# 开发环境: 留空或使用 *
# 生产环境: https://yourdomain.com
CORS_ORIGIN=*
```

### 访问应用

打开浏览器访问: `http://localhost:3001`

**首次使用**：需要注册一个新账户。注册后会自动登录，然后可以开始使用应用。

## 部署到服务器

### 1. 服务器要求

- Node.js (v14+)
- MongoDB (本地或 MongoDB Atlas)
- PM2 或其他进程管理器（推荐）

### 2. 部署步骤

```bash
# 1. 克隆或上传项目到服务器
git clone <repository-url>
cd FinalP

# 2. 安装依赖
npm install --production

# 3. 配置环境变量
# 创建 .env 文件并设置以下变量：
# - PORT: 服务器端口（如 3001）
# - NODE_ENV: production
# - MONGODB_URI: 生产环境数据库连接字符串
# - JWT_SECRET: 强随机密钥（必须更改！）
# - CORS_ORIGIN: 允许的前端域名（如 https://yourdomain.com）

# 4. 使用 PM2 启动（推荐）
npm install -g pm2
pm2 start backend/server.js --name health-app
pm2 save
pm2 startup

# 或直接启动
npm start
```

### 3. 使用 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 前端配置

前端会自动检测当前域名并连接到对应的 API。如果部署到不同域名，确保：

- 后端 CORS 配置包含前端域名
- 或前端和后端部署在同一域名下

## ⚠️ 部署注意事项

### 安全警告

1. **JWT 密钥**：生产环境必须更改 `JWT_SECRET` 环境变量！使用强随机密钥。

2. **数据库安全**：

   - 确保 MongoDB 有访问控制
   - 使用强密码
   - 限制数据库访问 IP（如果使用 MongoDB Atlas）

3. **CORS 配置**：

   - 生产环境务必设置 `CORS_ORIGIN` 为具体域名
   - 不要在生产环境使用 `*`

4. **HTTPS**：
   - 生产环境建议使用 HTTPS
   - 配置 SSL 证书

### 认证系统

应用现在包含完整的用户认证系统：

- **注册**：用户可以创建账户（用户名、邮箱、密码）
- **登录**：使用用户名/邮箱和密码登录
- **JWT 认证**：使用 JSON Web Tokens 进行安全的身份验证
- **数据隔离**：每个用户只能访问自己的数据
- **自动登出**：Token 过期或无效时自动登出

**安全特性**：

- 密码使用 bcrypt 加密存储
- JWT token 存储在 localStorage
- 所有 API 路由都需要认证（除了注册和登录）
- 输入验证和清理防止注入攻击

## Testing

```bash
npm test
```

## 故障排查

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### MongoDB 连接失败

- 检查 MongoDB 服务是否运行
- 验证 `MONGODB_URI` 环境变量是否正确
- 检查防火墙设置

## License

ISC
