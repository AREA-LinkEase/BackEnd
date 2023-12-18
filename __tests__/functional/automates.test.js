import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";
import { expect } from '@jest/globals';

let id

beforeAll(async () => {
    await setupTest()
});

afterAll(() => {
    getSequelize().close()
})

describe('POST /automates', () => {
    test('should create a new automate', async () => {
        const workspaceData = {
            title: "automate_test",
            workspace_id: 1,
            workflow: {},
            variables: {},
            secrets: {}
        }
        const response = await request(app)
            .post('/automates')
            .send(workspaceData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
    });
});

describe('GET /automates', () => {
    test('should get all automates', async () => {
        const response = await request(app).get('/automates');
        
        id = response.body.result[response.body.result.length - 1].id
        expect(response.status).toBe(200);
        response.body.result.forEach(automate => {
            expect(automate).toHaveProperty('title');
            expect(automate).toHaveProperty('workspace_id');
            expect(automate).toHaveProperty('workflow');
            expect(automate).toHaveProperty('variables');
            expect(automate).toHaveProperty('secrets');
        });
    });
});

describe('GET /automates/{automate_id}', () => {
    test('should get a automate by ID', async () => {
        const response = await request(app).get(`/automates/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.result).toHaveProperty('title');
        expect(response.body.result).toHaveProperty('workspace_id');
        expect(response.body.result).toHaveProperty('workflow');
        expect(response.body.result).toHaveProperty('variables');
        expect(response.body.result).toHaveProperty('secrets');
    });
});

describe('DELETE /automates/{automate_id}', () => {
    test('should delete a automate by ID', async () => {
        const response = await request(app).delete(`/automates/${id}`);

        expect(response.status).toBe(200);
    });
});