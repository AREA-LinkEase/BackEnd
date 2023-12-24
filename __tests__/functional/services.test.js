import {afterAll, beforeAll, describe, expect, test} from "@jest/globals";
import {setupTest} from "../../testBase.js";
import {getSequelize} from "../../app/getDataBaseConnection.js";
import request from "supertest";
import {app} from "../../config/express.js";

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

describe('/services/@me', () => {
    test('should create a service', async () => {
        const response = await request(app)
            .post('/services/@me')
            .send({
                "name": "test",
                "client_id": "test",
                "client_secret": "test",
                "scope": "test",
                "auth_url": "test",
                "token_url": "test",
                "is_private": false
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should get my service', async () => {
        const response = await request(app)
            .get('/services/@me')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((service) => {
            expect(service).toHaveProperty("name")
            expect(service).toHaveProperty("client_id")
            expect(service).toHaveProperty("client_secret")
            expect(service).toHaveProperty("scope")
            expect(service).toHaveProperty("auth_url")
            expect(service).toHaveProperty("token_url")
            expect(service).toHaveProperty("is_private")
        })
    });
    test('should get my private service', async () => {
        const response = await request(app)
            .get('/services/@me/private')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    test('should get my public service', async () => {
        const response = await request(app)
            .get('/services/@me/public')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
})

describe('/services/:id', () => {
    test('should get the service', async () => {
        const response = await request(app)
            .get('/services/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("name")
        expect(response.body).toHaveProperty("client_id")
        expect(response.body).toHaveProperty("client_secret")
        expect(response.body).toHaveProperty("scope")
        expect(response.body).toHaveProperty("auth_url")
        expect(response.body).toHaveProperty("token_url")
        expect(response.body).toHaveProperty("is_private")
    });
    test("should edit the name's service", async () => {
        const response = await request(app)
            .put('/services/1')
            .send({
                "name": "new title"
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/services/1')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(response2.body.name).toEqual("new title");
    });
    test('should get users in service', async () => {
        const response = await request(app)
            .get('/services/1/users')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    test('should add an user in service', async () => {
        const response = await request(app)
            .post('/services/1/users')
            .send({
                "id": 1
            })
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/services/1/users')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(Array.isArray(response2.body)).toBe(true);
        expect(response2.body.includes(1)).toBe(true);
    });
    test('should delete an user in service', async () => {
        const response = await request(app)
            .delete('/services/1/users/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        const response2 = await request(app)
            .get('/services/1/users')
            .set("Authorization", await getToken());

        expect(response2.status).toBe(200);
        expect(Array.isArray(response2.body)).toBe(true);
        expect(response2.body.includes(1)).not.toBe(true);
    });
})

describe('test service first connection process', () => {
    test('should redirect', async () => {
        let token = await getToken()
        const response = await request(app)
            .get('/service/connect/1/' + token.split(' ')[1])

        expect(response.status).toBe(302);
    })
})

describe('search service and delete service', () => {
    test('should find a service', async () => {
        const response = await request(app)
            .get('/services/search/new')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
    test('should find nothing', async () => {
        const response = await request(app)
            .get('/services/search/zzzzzzz')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toEqual(0);
    });
    test('should delete the service', async () => {
        const response = await request(app)
            .delete('/services/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(200);
    });
    test('should return 404', async () => {
        const response = await request(app)
            .get('/services/1')
            .set("Authorization", await getToken());

        expect(response.status).toBe(404);
    });
})

describe('test NotFound of connection service process', () => {
    test('should 404', async () => {
        let token = await getToken()
        const response = await request(app)
            .get('/service/connect/1/' + token.split(' ')[1])

        expect(response.status).toBe(404);
    })
})

describe('access test', () => {
    test('should return 401', async () => {
        const response = await request(app).get('/services/1');

        expect(response.status).toBe(401);
    });
})