const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const { getAuthHeaders, createTestUser } = require('./helpers');

describe('Exercise API Tests', () => {
    let testRecordId;
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

    test('POST /api/exercise - Create exercise record', async () => {
        const response = await request(app)
            .post('/api/exercise')
            .set(authHeaders)
            .send({
                type: 'running',
                duration: 30,
                intensity: 'medium',
                date: '2024-01-01',
                time: '18:00'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe('running');
        testRecordId = response.body.data._id.toString();
    });

    test('GET /api/exercise - Get all exercise records', async () => {
        const response = await request(app)
            .get('/api/exercise')
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('PUT /api/exercise/:id - Update exercise record', async () => {
        // Create a new record for update test
        const createResponse = await request(app)
            .post('/api/exercise')
            .set(authHeaders)
            .send({
                type: 'running',
                duration: 30,
                intensity: 'medium',
                date: '2024-01-01',
                time: '18:00'
            })
            .expect(201);
        const updateRecordId = createResponse.body.data._id.toString();

        const response = await request(app)
            .put(`/api/exercise/${updateRecordId}`)
            .set(authHeaders)
            .send({
                duration: 45
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.duration).toBe(45);
    });

    test('DELETE /api/exercise/:id - Delete exercise record', async () => {
        // Create a new record for delete test
        const createResponse = await request(app)
            .post('/api/exercise')
            .set(authHeaders)
            .send({
                type: 'running',
                duration: 30,
                intensity: 'medium',
                date: '2024-01-01',
                time: '18:00'
            })
            .expect(201);
        const deleteRecordId = createResponse.body.data._id.toString();

        const response = await request(app)
            .delete(`/api/exercise/${deleteRecordId}`)
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
    });
});

