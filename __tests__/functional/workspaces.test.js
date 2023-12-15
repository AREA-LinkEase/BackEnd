import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";

let id

beforeAll(async () => {
    await setupTest()
});

afterAll(() => {
    getSequelize().close()
})

describe('POST /workspaces', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const workspaceData = {
            title: "workspace_test",
            description: "workspace created with jest",
            is_private: false
        }
        const response = await request(app).post('/workspaces').send(workspaceData).set('Accept', 'application/json');

        expect(response.status).toBe(201);
    });
});

describe('GET /workspaces', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get('/workspaces');
        
        expect(response.status).toBe(200);
        id = response.body.result[response.body.result.length - 1].id
    });
});

describe('GET /workspaces/{workspace_id}', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get(`/workspaces/${id}`);

        expect(response.status).toBe(200);
        console.log(response.body)
    });
});

describe('GET /workspaces/private', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get('/workspaces/private');

        expect(response.status).toBe(200);
    });
});

describe('GET /workspaces/public', () => {
    test('should respond with status 200 and a JSON object', async () => {
        const response = await request(app).get('/workspaces/public');
        
        expect(response.status).toBe(200);
    });
});

describe('DELETE /workspaces/{workspace_id}', () => {
    test('should respond with status 200 and a JSON object', async () => {
        console.log(id)
        const response = await request(app).delete(`/workspaces/${id}`);

        expect(response.status).toBe(200);
    });
});
