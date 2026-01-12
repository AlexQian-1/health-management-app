const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const { getAuthHeaders, createTestUser } = require('./helpers');

describe('Diet API Tests', () => {
    let testRecordId;
    let authHeaders;
    let testUserId;
    const Diet = require('../backend/models/Diet');

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
        const { user, token } = await createTestUser();
        testUserId = user._id.toString();
        authHeaders = {
            'Authorization': `Bearer ${token}`
        };
    });

    // Remove beforeEach to avoid clearing data between tests in the same suite
    // Each test creates its own data, so no need to clear

    afterAll(async () => {
        // Clean up test data
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
        }
    });

    // Test creating a record
    test('POST /api/diet - Create diet record', async () => {
        const response = await request(app)
            .post('/api/diet')
            .set(authHeaders)
            .send({
                meal: 'breakfast',
                food: 'Oatmeal',
                calories: 300,
                date: '2024-01-01',
                time: '08:00'
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.food).toBe('Oatmeal');
        testRecordId = response.body.data._id.toString();
    });

    // Test getting all records
    test('GET /api/diet - Get all diet records', async () => {
        const response = await request(app)
            .get('/api/diet')
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Test updating a record
    test('PUT /api/diet/:id - Update diet record', async () => {
        // Create a new record for update test with unique data
        const createResponse = await request(app)
            .post('/api/diet')
            .set(authHeaders)
            .send({
                meal: 'lunch',
                food: 'Test Update Record',
                calories: 300,
                date: '2024-01-04',
                time: '12:00'
            })
            .expect(201);
        
        expect(createResponse.body.success).toBe(true);
        const updateRecordId = createResponse.body.data._id.toString();
        expect(updateRecordId).toBeTruthy();
        
        // Verify ID format
        expect(updateRecordId).toMatch(/^[0-9a-fA-F]{24}$/);

        // Verify record exists using Mongoose directly
        const record = await Diet.findById(updateRecordId);
        expect(record).toBeTruthy();
        expect(record.food).toBe('Test Update Record');

        // Update record
        const response = await request(app)
            .put(`/api/diet/${updateRecordId}`)
            .set(authHeaders)
            .send({
                calories: 350
            })
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.calories).toBe(350);
    });

    // Test deleting a record
    test('DELETE /api/diet/:id - Delete diet record', async () => {
        // Create a new record for delete test with unique data
        const createResponse = await request(app)
            .post('/api/diet')
            .set(authHeaders)
            .send({
                meal: 'dinner',
                food: 'Test Delete Record',
                calories: 500,
                date: '2024-01-03',
                time: '19:00'
            })
            .expect(201);
        
        expect(createResponse.body.success).toBe(true);
        const deleteRecordId = createResponse.body.data._id.toString();
        expect(deleteRecordId).toBeTruthy();
        
        // Verify ID format
        expect(deleteRecordId).toMatch(/^[0-9a-fA-F]{24}$/);

        // Verify record exists using Mongoose directly
        const record = await Diet.findById(deleteRecordId);
        expect(record).toBeTruthy();
        expect(record.food).toBe('Test Delete Record');

        // Delete record
        const response = await request(app)
            .delete(`/api/diet/${deleteRecordId}`)
            .set(authHeaders)
            .expect(200);

        expect(response.body.success).toBe(true);
    });

    // Test invalid data
    test('POST /api/diet - Invalid data should return error', async () => {
        const response = await request(app)
            .post('/api/diet')
            .set(authHeaders)
            .send({
                meal: 'invalid',
                calories: -100
            })
            .expect(400);

        expect(response.body.success).toBe(false);
    });
});

