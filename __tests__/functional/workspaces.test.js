import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";

beforeAll(async () => {
    await setupTest()
});

afterAll(() => {
    getSequelize().close()
})

describe('GET /workspaces', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get('/workspaces');

        expect(response.status).toBe(200);
    });
});

