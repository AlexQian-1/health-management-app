// API client class - handles all AJAX calls
export class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.timeout = 10000;
        this.token = localStorage.getItem('authToken') || null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication token
    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    // Clear authentication
    clearAuth() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authentication token if available
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Check response content type
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Server returned non-JSON format: ${text.substring(0, 100)}`);
            }
            
            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
                console.error(`API error [${response.status}]:`, url, errorMsg);
                
                // Handle authentication errors
                if (response.status === 401) {
                    this.clearAuth();
                    // Redirect to login if not already there
                    if (!window.location.href.includes('#auth')) {
                        window.location.reload();
                    }
                    throw new Error('Authentication required. Please login again.');
                }
                
                // Provide user-friendly error messages based on status code
                let userFriendlyMsg = errorMsg;
                if (response.status === 404) {
                    userFriendlyMsg = 'Requested resource not found';
                } else if (response.status === 400) {
                    userFriendlyMsg = 'Invalid request data format: ' + errorMsg;
                } else if (response.status === 500) {
                    userFriendlyMsg = 'Internal server error, please try again later';
                } else if (response.status === 0 || response.status >= 500) {
                    userFriendlyMsg = 'Server error, please try again later';
                }
                
                throw new Error(userFriendlyMsg);
            }
            
            return data;
        } catch (error) {
            if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                console.error('Network connection error:', url);
                throw new Error('Unable to connect to server, please ensure backend service is running');
            }
            if (error.message) {
                console.error('API request error:', url, error.message);
                throw error;
            }
            console.error('API request unknown error:', url, error);
            throw new Error('Request failed, please try again later');
        }
    }

    // GET request
    async get(endpoint) {
        const response = await this.request(endpoint, { method: 'GET' });
        return response.data || response;
    }

    // POST request
    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.data || response;
    }

    // PUT request
    async put(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.data || response;
    }

    // DELETE request
    async delete(endpoint) {
        const response = await this.request(endpoint, { method: 'DELETE' });
        return response.data || response;
    }

    // Diet records API
    async getDietRecords(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString();
        return this.get(`/diet${query ? '?' + query : ''}`);
    }

    async getDietRecord(id) {
        return this.get(`/diet/${id}`);
    }

    async createDietRecord(data) {
        return this.post('/diet', data);
    }

    async updateDietRecord(id, data) {
        return this.put(`/diet/${id}`, data);
    }

    async deleteDietRecord(id) {
        return this.delete(`/diet/${id}`);
    }

    // Exercise records API
    async getExerciseRecords() {
        return this.get('/exercise');
    }

    async getExerciseRecord(id) {
        return this.get(`/exercise/${id}`);
    }

    async createExerciseRecord(data) {
        return this.post('/exercise', data);
    }

    async updateExerciseRecord(id, data) {
        return this.put(`/exercise/${id}`, data);
    }

    async deleteExerciseRecord(id) {
        return this.delete(`/exercise/${id}`);
    }

    // Sleep records API
    async getSleepRecords() {
        return this.get('/sleep');
    }

    async getSleepRecord(id) {
        return this.get(`/sleep/${id}`);
    }

    async createSleepRecord(data) {
        return this.post('/sleep', data);
    }

    async updateSleepRecord(id, data) {
        return this.put(`/sleep/${id}`, data);
    }

    async deleteSleepRecord(id) {
        return this.delete(`/sleep/${id}`);
    }

    // Weight records API
    async getWeightRecords() {
        return this.get('/weight');
    }

    async getWeightRecord(id) {
        return this.get(`/weight/${id}`);
    }

    async createWeightRecord(data) {
        return this.post('/weight', data);
    }

    async updateWeightRecord(id, data) {
        return this.put(`/weight/${id}`, data);
    }

    async deleteWeightRecord(id) {
        return this.delete(`/weight/${id}`);
    }


    // Health goals API
    async getGoals() {
        return this.get('/goals');
    }

    async getGoal(id) {
        return this.get(`/goals/${id}`);
    }

    async createGoal(data) {
        return this.post('/goals', data);
    }

    async updateGoal(id, data) {
        return this.put(`/goals/${id}`, data);
    }

    async deleteGoal(id) {
        return this.delete(`/goals/${id}`);
    }

    // User profile API
    async getProfile() {
        return this.get('/profile');
    }

    async updateProfile(data) {
        return this.put('/profile', data);
    }

    // Statistics data API
    async getStatistics(period) {
        return this.get(`/statistics?period=${period}`);
    }

    // Dashboard data API
    async getDashboardData() {
        return this.get('/dashboard');
    }

    // Authentication API
    async register(username, email, password) {
        const response = await this.post('/auth/register', { username, email, password });
        // post() returns response.data, so check response.token directly
        if (response && response.token) {
            this.setToken(response.token);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        // Return full response structure for compatibility
        return { success: true, data: response };
    }

    async login(username, password) {
        const response = await this.post('/auth/login', { username, password });
        // post() returns response.data, so check response.token directly
        if (response && response.token) {
            this.setToken(response.token);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        // Return full response structure for compatibility
        return { success: true, data: response };
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    logout() {
        this.clearAuth();
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

