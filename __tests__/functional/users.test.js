import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";
import { expect } from '@jest/globals';

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

describe('POST /register', () => {
    test('should create a new user', async () => {
        const userData = {
            username: "user_test",
            password: "user created with jest",
            email: "user@test.com"
        }
        const response = await request(app)
            .post('/register')
            .send(userData)
            .set('Accept', 'application/x-www-urlencoded');

        expect(response.status).toBe(201);
    });
    test('should response 409', async () => {
        const userData = {
            username: "user_test",
            password: "user created with jest",
            email: "user@test.com"
        }
        const response = await request(app)
            .post('/register')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(409);
    });
});

describe('POST /login', () => {
    test('should login with username', async () => {
        const userData = {
            username: "user_test",
            password: "user created with jest"
        }
        const response = await request(app)
            .post('/login')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
    });
    test('should login with email', async () => {
        const userData = {
            username: "user@test.com",
            password: "user created with jest"
        }
        const response = await request(app)
            .post('/login')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
    });
    test('should response with 401', async () => {
        const userData = {
            username: "user@test.com",
            password: "use created with jest"
        }
        const response = await request(app)
            .post('/login')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
    });
    test('should response with 401', async () => {
        const userData = {
            username: "use@test.com",
            password: "user created with jest"
        }
        const response = await request(app)
            .post('/login')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
    });
});

describe('GET /users', () => {
    test('should get all users', async () => {
        const response = await request(app).get('/users').set("Authorization", await getToken());
        
        id = response.body.result[response.body.result.length - 1].id
        expect(response.status).toBe(200);
        response.body.result.forEach(user => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('password');
            expect(user).toHaveProperty('services');
        });
    });
    test('should response 401', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(401);
    });
});

describe('GET /users/{user_id}', () => {
    test('should get a user by ID', async () => {
        const response = await request(app).get(`/users/${id}`).set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body.result).toHaveProperty('username');
        expect(response.body.result).toHaveProperty('email');
        expect(response.body.result).toHaveProperty('password');
        expect(response.body.result).toHaveProperty('services');
    });
    test('should response 401', async () => {
        const response = await request(app).get(`/users/${id}`)

        expect(response.status).toBe(401);
    });
});

describe('DELETE /users/{user_id}', () => {
    test('should delete a user by ID', async () => {
        const response = await request(app).delete(`/users/${id}`).set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should response 401', async () => {
        const response = await request(app).delete(`/users/${id}`)

        expect(response.status).toBe(401);
    });
});
