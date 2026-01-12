const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const { getAuthHeaders, createTestUser } = require('./helpers');

describe('Profile API Tests', () => {
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

    test('GET /api/profile - Get profile', async () => {
        const response = await request(app)
            .get('/api/profile')
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('username');
    });

    test('PUT /api/profile - Update profile', async () => {
        // Ensure profile exists and get it first
        const getResponse = await request(app)
            .get('/api/profile')
            .set(authHeaders);
        expect(getResponse.body.success).toBe(true);

        // Update profile with complete data
        const response = await request(app)
            .put('/api/profile')
            .set(authHeaders)
            .send({
                name: 'Test User',
                age: 25,
                gender: 'male',
                height: 175,
                activityLevel: 'moderate'
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Test User');
        expect(response.body.data.age).toBe(25);
        expect(response.body.data.gender).toBe('male');
        expect(response.body.data.height).toBe(175);
        expect(response.body.data.activityLevel).toBe('moderate');
    });
});

