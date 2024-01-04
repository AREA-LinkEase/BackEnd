import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";
import {afterAll, beforeAll, describe, expect, test} from '@jest/globals';

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

describe('/automates/:id', () => {
    test('should get information of automate', async () => {
        const response = await request(app).get('/automates/1').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('is_private');
        expect(response.body).toHaveProperty('workspace_id');
        expect(response.body).toHaveProperty('is_enabled');
        expect(response.body).toHaveProperty('views');
        expect(response.body).toHaveProperty('workflow');
    });
    test('should edit title of automate', async () => {
        const response = await request(app)
            .put('/automates/1')
            .send({
                title: "new title"
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app).get('/automates/1').set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(response2.body.title).toEqual("new title")
    });
    test('should edit workflow', async () => {
        const response = await request(app)
            .put('/automates/1/workflow')
            .send({
                workflow: {"test": "test"}
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app).get('/automates/1').set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(response2.body.workflow).toHaveProperty("test")
    });
    test('should get logs of the automate', async () => {
        const response = await request(app)
            .get('/automates/1/logs')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true)
    });
    test('should clear logs of the automate', async () => {
        const response = await request(app)
            .delete('/automates/1/logs')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/automates/1/logs')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(Array.isArray(response2.body)).toBe(true)
        expect(response2.body).toHaveLength(0)
    });
    test('should find an automate', async () => {
        const response = await request(app)
            .get('/automates/search/new')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(1)
    });
    test('should delete an automate', async () => {
        const response = await request(app)
            .delete('/automates/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should find nothing', async () => {
        const response = await request(app)
            .get('/automates/search/new')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(0)
    });
    test('should response 401', async () => {
        const response = await request(app).get('/automates/1');

        expect(response.status).toBe(401);
    });
});