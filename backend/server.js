// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS配置：支持环境变量配置，默认允许所有来源（开发环境）
const corsOptions = {
    origin: process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN 
        ? '*' 
        : process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving (enabled for both development and production)
app.use(express.static(path.join(__dirname, '../frontend')));

// Root path handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connect to MongoDB (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthapp';
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('MongoDB connected successfully');
    }).catch(err => {
        console.error('MongoDB connection failed:', err);
    });
}

// Import routes
const authRoutes = require('./routes/auth');
const dietRoutes = require('./routes/diet');
const exerciseRoutes = require('./routes/exercise');
const sleepRoutes = require('./routes/sleep');
const weightRoutes = require('./routes/weight');
const goalRoutes = require('./routes/goals');
const profileRoutes = require('./routes/profile');
const statisticsRoutes = require('./routes/statistics');
const dashboardRoutes = require('./routes/dashboard');

// Health check route (public)
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running normally' });
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/diet', dietRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// API route 404 handler (only for /api paths)
app.use('/api/*', (req, res) => {
    console.log(`404 - API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        success: false, 
        message: 'API route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Frontend route 404 handler (SPA route fallback)
app.use((req, res) => {
    // If not an API request, return frontend HTML (supports SPA routing)
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'Route not found',
            path: req.originalUrl,
            method: req.method
        });
    }
});

// Start server (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    // Handle server errors (e.g., port already in use)
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ 错误: 端口 ${PORT} 已被占用！`);
            console.error(`\n解决方案:`);
            console.error(`1. 关闭占用端口的进程:`);
            console.error(`   Windows: netstat -ano | findstr :${PORT}`);
            console.error(`   然后使用: taskkill /PID <进程ID> /F`);
            console.error(`2. 或者使用其他端口: PORT=3001 npm run dev\n`);
            process.exit(1);
        } else {
            console.error('服务器启动错误:', err);
            process.exit(1);
        }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        mongoose.connection.close(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
}

// Export app for testing
module.exports = app;

