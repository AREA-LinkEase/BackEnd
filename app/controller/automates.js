import {
    getAutomateById,
    searchAutomates,
} from "../model/automates.js"
import {getWorkspaceById} from "../model/workspaces.js"
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js";

/**
 * @swagger
 * tags:
 *   name: Automates
 *   description: Operations related to automates
 *
 *
 * /automates/search/{input}:
 *   get:
 *     summary: Search automates by input
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: input
 *         schema:
 *           type: string
 *         required: true
 *         description: The search input
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful search
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   workflow:
 *                     type: string
 *                   workspace_id:
 *                     type: integer
 *                   views:
 *                     type: integer
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}/logs:
 *   get:
 *     summary: Get logs for a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful retrieval of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}/logs:
 *   delete:
 *     summary: Delete logs for a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Logs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}/workflow:
 *   put:
 *     summary: Update workflow for a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *       - in: body
 *         name: body
 *         required: true
 *         description: Workflow data
 *         schema:
 *           type: object
 *           properties:
 *             workflow:
 *               type: object
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Workflow updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '422':
 *         description: Unprocessable Entity
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}:
 *   get:
 *     summary: Get details of a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful retrieval of automate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 is_private:
 *                   type: boolean
 *                 workspace_id:
 *                   type: integer
 *                 is_enabled:
 *                   type: boolean
 *                 views:
 *                   type: integer
 *                 workflow:
 *                   type: object
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}:
 *   put:
 *     summary: Update details of a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *       - in: body
 *         name: body
 *         required: true
 *         description: Automate details
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             is_private:
 *               type: boolean
 *             is_enabled:
 *               type: boolean
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Automate details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '422':
 *         description: Unprocessable Entity
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /automates/{id}:
 *   delete:
 *     summary: Delete a specific automate
 *     tags: [Automates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the automate
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Automate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */


export default function index(app) {
    app.get('/automates/search/:input', async (request, response) => {
        try {
            let input = request.params.input
            let automates = await searchAutomates(input)
            let results = [];

            for (const automate of automates) {
                if (automate.is_private) continue;
                results.push({
                    id: automate.id,
                    title: automate.title,
                    workflow: automate.workflow,
                    workspace_id: automate.workspace_id,
                    views: automate.views,
                    color: automate.color
                })
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/automates/:id/logs', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id)) {
                return Forbidden(response)
            }
            return response.status(200).json(automate.logs)
        } catch(error) {
            return InternalError(response)
        }
    })
    app.delete('/automates/:id/logs', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
                return Forbidden(response)
            await automate.update({
                logs: []
            })
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.put('/automates/:id/workflow', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id
        let body = request.body

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            if (!Object.keys(body).every((value) => ["workflow"].includes(value)))
                return UnprocessableEntity(response)
            if (!("workflow" in body) || typeof body["workflow"] !== "object" || Array.isArray(body["workflow"]))
                return UnprocessableEntity(response)
            await automate.update(body)
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.get('/automates/:id', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id)) {
                if (workspace.is_private)
                    return Forbidden(response)
                return response.status(200).json({
                    id: automate.id,
                    title: automate.title,
                    is_private: automate.is_private,
                    workspace_id: automate.workspace_id,
                    is_enabled: automate.is_enabled,
                    views: automate.views,
                    workflow: automate.workflow,
                    color: automate.color,
                    description: automate.description
                })
            }
            return response.status(200).json(automate.toJSON())
        } catch(error) {
            return InternalError(response)
        }
    })
    app.put('/automates/:id', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id
        let body = request.body

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
                return Forbidden(response)
            if (!Object.keys(body).every((value) => ["title", "is_private", "is_enabled"].includes(value)))
                return UnprocessableEntity(response)
            if (("title" in body && typeof body['title'] !== "string") ||
                ("is_private" in body && typeof body['is_private'] !== "boolean") |
                ("is_enabled" in body && typeof body["is_enabled"] !== "boolean"))
                return UnprocessableEntity(response)
            await automate.update(body)
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.delete('/automates/:id', async (request, response) => {
        let automate_id = parseInt(request.params.id)
        let user_id = response.locals.user.id

        try {
            let automate = await getAutomateById(automate_id)
            if (automate === null)
                return NotFound(response)
            let workspace = await getWorkspaceById(automate.workspace_id)
            if (workspace === null)
                return InternalError(response)
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
                return Forbidden(response)
            await automate.destroy()
            return response.status(200).json({result: "Automate deleted successfully"})
        } catch(error) {
            console.log(error)
            return InternalError(response)
        }
    })
}
