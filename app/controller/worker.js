import {getAutomateById} from "../model/automates.js";
import {InternalError, NotFound} from "../utils/request_error.js";
import {getWorkspaceById} from "../model/workspaces.js";
import {getAccessToken, getUserById} from "../model/users.js";
import {getEventById} from "../model/events.js";
import {getServiceByName} from "../model/services.js";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     TokenWorker:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Use a special token without the Bearer prefix for workers
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: A brief description of the error.
 *       example:
 *         error: Unauthorized
 */

/**
 * @swagger
 * tags:
 *   name: Worker
 *   description: Endpoints related to worker operations
 */

/**
 * @swagger
 * /worker/automate/{id}/logs:
 *   put:
 *     summary: Update logs for a specific automate
 *     tags: [Worker]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the automate
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logs:
 *                 type: array
 *                 description: An array of log entries to append
 *             example:
 *               logs: ["Log entry 1", "Log entry 2"]
 *     responses:
 *       200:
 *         description: Automate updated successfully
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (Insufficient permissions)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /worker/@next:
 *   get:
 *     summary: Get information for the next automate in sequence
 *     tags: [Worker]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 workspace:
 *                   $ref: '#/components/schemas/Workspace'
 *                 automate:
 *                   $ref: '#/components/schemas/Automate'
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (Insufficient permissions)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not Found (Automate not found)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /worker/events/{id}/workflow:
 *   get:
 *     tags: [Worker]
 *     security:
 *       - ApiKeyAuth: []
 *     summary: Get the workflow for a worker event by ID.
 *     description: |
 *       This endpoint allows authorized workers to retrieve the workflow associated with a worker event by its ID.
 *       A special token for workers is required to access this route.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the worker event.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with the workflow.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: The workflow associated with the worker event.
 *       401:
 *         description: Unauthorized. Special worker token is required.
 *       403:
 *         description: Forbidden. Access to this route is not allowed.
 *       500:
 *         description: Internal Server Error. An error occurred while processing the request.
 */


let id = 0;

export default function index(app) {
    app.put('/worker/automate/:id/logs', async (request, response) => {
        try {
            let automate_id = parseInt(request.params.id)
            let body = request.body;
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let logs = [...automate.logs, ...body.logs];
            automate.update({logs})
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.get('/worker/@next', async (request, response) => {
        try {
            let automate = await getAutomateById(id);
            if (automate === null) {
                id = 1;
                automate = await getAutomateById(id);
                if (automate === null)
                    return NotFound(response);
            }
            id++;
            let workspace = await getWorkspaceById(automate.workspace_id);
            let users = [];

            users.push(await getUserById(workspace.owner_id))
            for (const user of workspace.users_id)
                users.push(await getUserById(user.id))

            for (const user of users) {
                let tokens = {}

                for (const serviceName of Object.keys(user.services)) {
                    let service = await getServiceByName(serviceName)
                    let accessToken= await getAccessToken(user.id, service.id)
                    if (accessToken)
                        tokens[serviceName] = accessToken
                }
                user.tokens = tokens;
            }

            return response.status(200).json({
                "users": users,
                "workspace": workspace,
                "automate": automate
            })
        } catch (e) {
            console.log(e)
            return InternalError(response)
        }
    })
    app.get("/worker/events/:id/workflow", async (request, response) => {
        try {
            let event_id = parseInt(request.params.id);
            let event = await getEventById(event_id);

            if (event === null)
                return NotFound(response)
            return response.status(200).json(event.workflow)
        } catch (error) {
            return InternalError(response)
        }
    })
}