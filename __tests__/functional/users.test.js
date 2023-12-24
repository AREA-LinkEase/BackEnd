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

describe('GET /users/@me', () => {
    test('should get information about me', async () => {
        const response = await request(app).get('/users/@me').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('password');
        expect(response.body).toHaveProperty('services');
    });
    test('should response 401', async () => {
        const response = await request(app).get('/users/@me');

        expect(response.status).toBe(401);
    });
});

describe('PUT /users/@me', () => {
    test('should edit my email', async () => {
        const userData = {
            email: "user_test1@test.com",
        }
        const response = await request(app).put('/users/@me')
            .send(userData)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);

        const response2 = await request(app).get('/users/@me').set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(response2.body.email).toEqual("user_test1@test.com")
    });
    test('should response 401', async () => {
        const response = await request(app).get('/users/@me');

        expect(response.status).toBe(401);
    });
});

describe('/users/@me/friends', () => {
    test('should add my friend', async () => {
        const userData = {
            friends: [1],
        }
        const response = await request(app).post(`/users/@me/friends`)
            .send(userData)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should response 401', async () => {
        const response = await request(app).post(`/users/@me/friends`)

        expect(response.status).toBe(401);
    });
    test('should get my friend', async () => {
        const response = await request(app).get(`/users/@me/friends`)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        response.body.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('id');
        })
    });
    test('should response 401', async () => {
        const response = await request(app).get(`/users/@me/friends`)

        expect(response.status).toBe(401);
    });
    test('should remove my friend', async () => {
        const response = await request(app).delete(`/users/@me/friends/1`)
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app).get(`/users/@me/friends`)
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(response2.body.length).toEqual(0);
    });
    test('should response 401', async () => {
        const response = await request(app).delete(`/users/@me/friends`)

        expect(response.status).toBe(401);
    });
});

describe('GET /users/{user_id}', () => {
    test('should get an user', async () => {
        const response = await request(app).get('/users/1').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('id');
    });
    test('should found nothing', async () => {
        const response = await request(app).get('/users/100').set("Authorization", await getToken());

        expect(response.status).toBe(404);
    });
    test('should response 401', async () => {
        const response = await request(app).get(`/users/1`)

        expect(response.status).toBe(401);
    });
});

describe('GET /users/search/{input}', () => {
    test('should get users', async () => {
        const response = await request(app).get('/users/search/test').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        response.body.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('id');
        })
    });
    test('should found nothing', async () => {
        const response = await request(app).get('/users/search/100').set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(0);
    });
    test('should response 401', async () => {
        const response = await request(app).get(`/users/search/test`)

        expect(response.status).toBe(401);
    });
});
