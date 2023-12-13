import request from 'supertest';
import { app } from '../../config/express.js';

beforeAll(async () => {
    await app.listen(5050);
});


describe('GET /workspaces', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get('/workspaces');

        expect(response.status).toBe(200);
    });
});
