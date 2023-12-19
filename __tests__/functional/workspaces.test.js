import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";
import { expect } from '@jest/globals';

let id

beforeAll(async () => {
    await setupTest()
});

let token = null;

async function getToken() {
    if (token) return token;
    const userData = {
        username: "test",
        password: "test",
    }
    const response = await request(app)
        .post('/login')
        .set('Accept', 'application/json')
        .send(userData)
    token = response.body.jwt;
    return token
}

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
            .set('Accept', 'application/json').set("Authorization", await getToken());

        expect(response.status).toBe(201);
    });
    test('should return 401', async () => {
        const workspaceData = {
            title: "workspace_test",
            description: "workspace created with jest",
            is_private: false
        }
        const response = await request(app)
            .post('/workspaces')
            .send(workspaceData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
    });
});

describe('GET /workspaces', () => {
    test('should get all workspaces', async () => {
        const response = await request(app).get('/workspaces').set("Authorization", await getToken());
        
        id = response.body.result[response.body.result.length - 1].id
        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
        });
    });
    test('should return 401', async () => {
        const response = await request(app).get('/workspaces');

        expect(response.status).toBe(401);
    });
});

describe('GET /workspaces/{workspace_id}', () => {
    test('should get a workspace by ID', async () => {
        const response = await request(app).get(`/workspaces/${id}`).set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.result).toHaveProperty('title');
        expect(response.body.result).toHaveProperty('description');
        expect(response.body.result).toHaveProperty('is_private');
    });
    test('should return 401', async () => {
        const response = await request(app).get(`/workspaces/${id}`);

        expect(response.status).toBe(401);
    });
});

describe('PUT /workspaces/{workspace_id}', () => {
    test('should modify a workspace by ID', async () => {
        const updatedWorkspace = { title: 'Workspace Modifié' };
        const response = await request(app)
            .put(`/workspaces/${id}`)
            .send(updatedWorkspace).set("Authorization", await getToken());
    
        expect(response.status).toBe(200);
      });
    test('should return 401', async () => {
        const updatedWorkspace = { title: 'Workspace Modifié' };
        const response = await request(app)
            .put(`/workspaces/${id}`)
            .send(updatedWorkspace)

        expect(response.status).toBe(401);
    });
})

describe('GET /workspaces/private', () => {
    test('should get all private workspaces', async () => {
        const response = await request(app).get('/workspaces/private').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
            expect(workspace.is_private).toBe(true)
        });
    });
    test('should return 401', async () => {
        const response = await request(app).get('/workspaces/private');

        expect(response.status).toBe(401);
    });
});

describe('GET /workspaces/public', () => {
    test('should get all public workspaces', async () => {
        const response = await request(app).get('/workspaces/public').set("Authorization", await getToken());
        
        expect(response.status).toBe(200);
        response.body.result.forEach(workspace => {
            expect(workspace).toHaveProperty('title');
            expect(workspace).toHaveProperty('description');
            expect(workspace).toHaveProperty('is_private');
            expect(workspace.is_private).toBe(false)
        });
    });
    test('should return 401', async () => {
        const response = await request(app).get('/workspaces/public');

        expect(response.status).toBe(401);
    });
});

describe('DELETE /workspaces/{workspace_id}', () => {
    test('should delete a workspace by ID', async () => {
        const response = await request(app).delete(`/workspaces/${id}`).set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should delete a workspace by ID', async () => {
        const response = await request(app).delete(`/workspaces/${id}`);

        expect(response.status).toBe(401);
    });
});
