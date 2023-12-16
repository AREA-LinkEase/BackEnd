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

describe('POST /workspaces', () => {
    test('should create a new workspace', async () => {
        const workspaceData = {
            title: "workspace_test",
            description: "workspace created with jest",
            is_private: false
        }
        const response = await request(app)
            .post('/workspaces')
            .send(workspaceData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
    });
});

describe('GET /workspaces', () => {
    test('should get all workspaces', async () => {
        const response = await request(app).get('/workspaces');
        
        id = response.body.result[response.body.result.length - 1].id
        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
        });
    });
});

describe('GET /workspaces/{workspace_id}', () => {
    test('should get a workspace by ID', async () => {
        const response = await request(app).get(`/workspaces/${id}`);

        expect(response.status).toBe(200);
        expect(response.body.result).toHaveProperty('title');
        expect(response.body.result).toHaveProperty('description');
        expect(response.body.result).toHaveProperty('is_private');
    });
});

describe('PUT /workspaces/{workspace_id}', () => {
    test('should modify a workspace by ID', async () => {
        const updatedWorkspace = { title: 'Workspace Modifié' };
        const response = await request(app)
            .put(`/workspaces/${id}`)
            .send(updatedWorkspace);
    
        expect(response.status).toBe(200);
      });
})

describe('GET /workspaces/private', () => {
    test('should get all private workspaces', async () => {
        const response = await request(app).get('/workspaces/private');

        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
            expect(workspace.is_private).toBe(true)
        });
    });
});

describe('GET /workspaces/public', () => {
    test('should get all public workspaces', async () => {
        const response = await request(app).get('/workspaces/public');
        
        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
            expect(workspace.is_private).toBe(false)
        });
    });
});

describe('DELETE /workspaces/{workspace_id}', () => {
    test('should delete a workspace by ID', async () => {
        const response = await request(app).delete(`/workspaces/${id}`);

        expect(response.status).toBe(200);
    });
});
