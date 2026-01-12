const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const { getAuthHeaders, createTestUser } = require('./helpers');

describe('Dashboard API Tests', () => {
    let authHeaders;

    beforeAll(async () => {
        // Close connection if already connected
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        // Connect to test database
        await mongoose.connect('mongodb://localhost:27017/healthapp_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Create test user and get auth token
        const { token } = await createTestUser();
        authHeaders = {
            'Authorization': `Bearer ${token}`
        };
    });

    afterAll(async () => {
        // Clean up test data
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
        }
    });

    test('GET /api/dashboard - Get dashboard data', async () => {
        const response = await request(app)
            .get('/api/dashboard')
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('calories');
        expect(response.body.data).toHaveProperty('exercise');
        expect(response.body.data).toHaveProperty('sleep');
        expect(response.body.data).toHaveProperty('recentActivities');
    });
});

