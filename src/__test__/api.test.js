const request = require('supertest');
const app = require('../../index'); // Adjust this import based on your app's structure
const { db } = require('../model/dbConnection');
require('dotenv').config();

jest.mock('../model/dbConnection', () => {
    return {
        db: {
            query: jest.fn(),
        },
    };
});


const mockData = [
    { value: 25, created_at: '2024-10-28T12:00:00Z' },
    { value: 30, created_at: '2024-10-28T12:05:00Z' },
    { value: 28, created_at: '2024-10-28T12:10:00Z' },
];

describe('GET /api/data', () => {
    beforeEach(() => {
        db.query.mockClear();
    });

    //get the same data that has created at atribut
    it('should retrieve temperature data with created_at in UTC format', async () => {
        db.query.mockImplementation((query, values, callback) => {
            callback(null, mockData);
        });

        const response = await request(app).get('/api/data'); // Hardcoded for debugging

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveLength(mockData.length);
        response.body.data.forEach((item) => {
            expect(item).toHaveProperty('value');
            expect(item).toHaveProperty('created_at');
            expect(item.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        });
    });

});
