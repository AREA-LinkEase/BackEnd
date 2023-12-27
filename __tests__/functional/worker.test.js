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

describe('PUT /worker/automate/:id/logs', () => {
    test('should add logs', async () => {
        const response = await request(app)
            .put('/worker/automate/1/logs')
            .send({
                "logs": ["test1", "test2"]
            })
            .set("Authorization", process.env.WORKER_KEY);

        expect(response.status).toBe(200);
    });
    test('should response 401', async () => {
        const response = await request(app)
            .put('/worker/automate/1/logs')
            .send({
                "logs": ["test1", "test2"]
            });

        expect(response.status).toBe(401);
    });
});

describe('GET /worker/@next', () => {
    test('should get next automate', async () => {
        const response = await request(app)
            .get('/worker/@next')
            .set("Authorization", process.env.WORKER_KEY);

        expect(response.status).toBe(200);
    });
    test('should response 401', async () => {
        const response = await request(app)
            .get('/worker/@next');

        expect(response.status).toBe(401);
    });
});