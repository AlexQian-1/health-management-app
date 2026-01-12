// Main entry file - only global function DOMContentLoaded
import { ViewManager } from './modules/ViewManager.js';
import { ApiClient } from './modules/ApiClient.js';
import { DataManager } from './modules/DataManager.js';
import { EventHandler } from './modules/EventHandler.js';
import { MessageManager } from './modules/MessageManager.js';

// Global variables
let viewManager;
let apiClient;
let dataManager;
let eventHandler;
let messageManager;

// Only allowed global function
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all managers
    // 动态获取API基础URL：生产环境使用当前域名，开发环境使用localhost
    const getApiBaseURL = () => {
        // 如果当前是localhost或127.0.0.1，使用开发环境配置
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        // 生产环境：使用当前域名和端口
        return `${window.location.protocol}//${window.location.host}/api`;
    };
    apiClient = new ApiClient(getApiBaseURL());
    messageManager = new MessageManager();
    dataManager = new DataManager(apiClient, messageManager);
    viewManager = new ViewManager();
    eventHandler = new EventHandler(viewManager, dataManager, apiClient, messageManager);
    
    // Check authentication
    if (apiClient.isAuthenticated()) {
        try {
            // Verify token is still valid
            await apiClient.getCurrentUser();
            // User is authenticated, show main app
            // Hide login view and show navigation
            const authView = document.getElementById('view-auth');
            const navBar = document.getElementById('main-nav');
            if (authView) authView.classList.remove('active');
            if (navBar) navBar.style.display = 'block';
            
            viewManager.showView('dashboard');
            eventHandler.init();
            dataManager.loadDashboardData();
        } catch (error) {
            // Token invalid, clear auth and show login
            apiClient.logout();
            // Hide navigation and show login
            const navBar = document.getElementById('main-nav');
            if (navBar) navBar.style.display = 'none';
            viewManager.showView('auth');
            eventHandler.initAuth();
        }
    } else {
        // Not authenticated, show login page
        // Hide navigation bar
        const navBar = document.getElementById('main-nav');
        if (navBar) navBar.style.display = 'none';
        viewManager.showView('auth');
        eventHandler.initAuth();
    }
});

