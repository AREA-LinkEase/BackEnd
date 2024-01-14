import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {afterAll, beforeAll, describe, expect, test} from '@jest/globals';
import {getSequelize} from "../../app/getDataBaseConnection.js";

beforeAll(async () => {
    await setupTest()
});

afterAll(async () => {
    await getSequelize().close()
})

let token = null;

async function getToken() {
    if (token) return token;
    const userData = {
        username: "user_test",
        password: "user created with jest",
    }
    const response = await request(app)
        .post('/auth/login')
        .send(userData)
        .set('Accept', 'application/json')
    expect(response.status).toBe(200)
    expect(response.body.jwt).toBeDefined()
    token = response.body.jwt;
    return token
}

describe('/workspaces/@me', () => {
    test('should create public workspace', async () => {
        const data = {
            title: "title 1",
            description: "beautiful description",
            is_private: false,
            users_id: []
        }
        const response = await request(app)
            .post('/workspaces/@me')
            .send(data)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should response 401', async () => {
        const response = await request(app).post('/workspaces/@me');

        expect(response.status).toBe(401);
    });
    test('should create private workspace', async () => {
        const data = {
            title: "title 2",
            description: "beautiful description",
            is_private: true,
            users_id: []
        }
        const response = await request(app)
            .post('/workspaces/@me')
            .send(data)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should get workspaces', async () => {
        const response = await request(app)
            .get('/workspaces/@me')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(3);
        response.body.forEach((workspace) => {
            expect(workspace).toHaveProperty("id")
            expect(workspace).toHaveProperty("title")
            expect(workspace).toHaveProperty("description")
            expect(workspace).toHaveProperty("is_private")
            expect(workspace).toHaveProperty("owner_id")
            expect(workspace).toHaveProperty("users_id")
            expect(workspace).toHaveProperty("variables")
            expect(workspace).toHaveProperty('color');
            expect(workspace).toHaveProperty("views")
            expect(workspace).toHaveProperty("is_enabled")
        })
    });
    test('should get workspace in public space', async () => {
        const response = await request(app)
            .get('/workspaces/@me/public')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
        response.body.forEach((workspace) => {
            expect(workspace).toHaveProperty("id")
            expect(workspace).toHaveProperty("title")
            expect(workspace).toHaveProperty("description")
            expect(workspace).toHaveProperty("is_private")
            expect(workspace).toHaveProperty("owner_id")
            expect(workspace).toHaveProperty("users_id")
            expect(workspace).toHaveProperty("variables")
            expect(workspace).toHaveProperty('color');
            expect(workspace).toHaveProperty("views")
            expect(workspace).toHaveProperty("is_enabled")
        })
    });
    test('should get workspace in private space', async () => {
        const response = await request(app)
            .get('/workspaces/@me/private')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        response.body.forEach((workspace) => {
            expect(workspace).toHaveProperty("id")
            expect(workspace).toHaveProperty("title")
            expect(workspace).toHaveProperty("description")
            expect(workspace).toHaveProperty("is_private")
            expect(workspace).toHaveProperty("owner_id")
            expect(workspace).toHaveProperty("users_id")
            expect(workspace).toHaveProperty("variables")
            expect(workspace).toHaveProperty('color');
            expect(workspace).toHaveProperty("views")
            expect(workspace).toHaveProperty("is_enabled")
        })
    });
    test('should response 401', async () => {
        const response1 = await request(app).get('/workspaces/@me');
        const response2 = await request(app).get('/workspaces/@me/public');
        const response3 = await request(app).get('/workspaces/@me/private');

        expect(response1.status).toBe(401);
        expect(response2.status).toBe(401);
        expect(response3.status).toBe(401);
    });
});

describe('/workspaces/:id', () => {
    test('should get workspace', async () => {
        const response = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("title")
        expect(response.body).toHaveProperty("description")
        expect(response.body).toHaveProperty("is_private")
        expect(response.body).toHaveProperty("owner_id")
        expect(response.body).toHaveProperty("users_id")
        expect(response.body).toHaveProperty("variables")
        expect(response.body).toHaveProperty('color');
        expect(response.body).toHaveProperty("views")
        expect(response.body).toHaveProperty("is_enabled")
    });
    test('should return NotFound', async () => {
        const response = await request(app)
            .get('/workspaces/100')
            .set("Authorization", await getToken());

        expect(response.status).toBe(404);
    });
    test('should edit workspace', async () => {
        const response = await request(app)
            .put('/workspaces/1')
            .send({
                title: "changed title"
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(response2.body.title).toEqual("changed title")
    });
})

describe('/workspaces/:id/variable/:name', () => {
    test('should create variable', async () => {
        const response = await request(app)
            .post('/workspaces/1/variables/test')
            .send({
                "content": "test"
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(response2.body.variables).toHaveProperty("test")
        expect(response2.body.variables.test).toEqual("test")
    });
    test('should delete variable', async () => {
        const response = await request(app)
            .delete('/workspaces/1/variables/test')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(Object.keys(response2.body.variables).length).toEqual(0)
    });
})

describe('/workspaces/:id/users', () => {
    test('should add user to workspace', async () => {
        const response = await request(app)
            .post('/workspaces/1/users')
            .send({
                "id": 1,
                "permission": 2
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(response2.body.users_id.length).toEqual(1)
        expect(response2.body.users_id[0].id).toEqual(1)
    });
    test('should remove user from workspace', async () => {
        const response = await request(app)
            .delete('/workspaces/1/users/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(response2.body.users_id.length).toEqual(0)
    });
})

describe('POST /workspaces/:id/automate', () => {
    test('should add automate to workspace', async () => {
        const response = await request(app)
            .post('/workspaces/1/automate')
            .send({
                "title": "automate1",
                "description": "a description",
                "is_private": true
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/workspaces/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200)
        expect(response2.body.automates.length).toBeGreaterThanOrEqual(2)
    });
})

describe('GET /workspaces/search/:input', () => {
    test('should find workspaces', async () => {
        const response = await request(app)
            .get('/workspaces/search/title')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2)
    });
    test('should get nothing', async () => {
        const response = await request(app)
            .get('/workspaces/search/zzzzz')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(0);
    });
})

describe('GET /workspaces/@all', () => {
    test('should response correctly', async () => {
        const response = await request(app)
          .get('/workspaces/@all')
          .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
})