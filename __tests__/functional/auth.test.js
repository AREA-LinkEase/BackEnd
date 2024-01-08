import request from 'supertest';
import { app } from '../../config/express.js';
import {setupTest} from "../../testBase.js";
import {afterAll, beforeAll, describe, expect, jest, test} from '@jest/globals';
import {getSequelize} from "../../app/getDataBaseConnection.js";

beforeAll(async () => {
    jest.setTimeout(60000)
    await setupTest()
});

afterAll(async () => {
    await getSequelize().close()
})

describe('POST /auth/login', () => {
    test('should login with username', async () => {
        const userData = {
            username: "user_test",
            password: "user created with jest"
        }
        const response = await request(app)
            .post('/auth/login')
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
            .post('/auth/login')
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
            .post('/auth/login')
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
            .post('/auth/login')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(404);
    });
});

describe('POST /auth/register', () => {
    test('should create a new user', async () => {
        const userData = {
            username: "test_test",
            password: "user created with jest",
            email: "test@test.com"
        }
        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .set('Accept', 'application/json');
        expect(response.status).toBe(201);
    });
    test('should response 409', async () => {
        const userData = {
            username: "user_test",
            password: "user created with jest",
            email: "user@test.com"
        }
        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(409);
    });
    test('should redirect to Discord OAuth login', async () => {
        client_id = process.env.DISCORD_CLIENT_ID;
        redirect_uri = process.env.DISCORD_REDIRECT_URI;

        const response = await request(app).get('/auth/login/discord');
        expect(response.status).toBe(302);
    
        const expectedRedirectUri = `https://discord.com/api/oauth2/authorize?client_id=` + client_id + `&redirect_uri=` + +redirect_uri  `&response_type=code&scope=identify%20email`;
        expect(response.header['location']).toBe(expectedRedirectUri);
    });
    test('should redirect to GitHub OAuth login', async () => {
        client_id = process.env.DISCORD_CLIENT_ID;
        redirect_uri = process.env.DISCORD_REDIRECT_URI;
    
        const response = await request(app).get('/auth/login/github');
        expect(response.status).toBe(302);
    
        const expectedRedirectUri = `https://github.com/login/oauth/authorize?client_id=` + client_id + `&redirect_uri=` + redirect_uri + `&response_type=code`;
        expect(response.header['location']).toBe(expectedRedirectUri);
    });
    
    test('should redirect to Google OAuth login', async () => {
        client_id = process.env.DISCORD_CLIENT_ID;
        redirect_uri = process.env.DISCORD_REDIRECT_URI;
    
        const response = await request(app).get('/auth/login/google');
        expect(response.status).toBe(302);
    
        const expectedRedirectUri = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=` + client_id + `&redirect_uri=` + redirect_uri + `&scope=https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/userinfo.email`;
        expect(response.header['location']).toBe(expectedRedirectUri);
    });
});