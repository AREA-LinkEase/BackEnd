import {
    getAutomateById,
    searchAutomates,
} from "../model/automates.js"
import {getWorkspaceById} from "../model/workspaces.js"
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js";

/**
 * @openapi
 * /automates:
 *   post:
 *     tags:
 *       - automates
 *     description: Create a new automate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               workspace_id:
 *                 type: integer
 *               workflow:
 *                 type: object
 *                 properties:
 *                   testJson:
 *                     type: string
 *               variables:
 *                 type: object
 *                 properties:
 *                   testJson:
 *                     type: string
 *               secrets:
 *                 type: object
 *                 properties:
 *                   testJson:
 *                     type: string
 *     responses:
 *       201:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown workspace_id
 *       422:
 *         description: Missing field
 *       500:
 *         description: Error
 * /automates/{workspace_id}:
 *   get:
 *     tags:
 *       - automates
 *     description: Get automate by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the workspace of the automate
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown workspace_id or automate_id
 *       500:
 *         description: Error
 * /automates/{workspace_id}/{automate_id}:
 *   get:
 *     tags:
 *       - automates
 *     description: Get automate by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the workspace of the automate
 *       - in: path
 *         name: automate_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the automate to get
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown workspace_id or automate_id
 *       500:
 *         description: Error
 *   put:
 *     tags:
 *       - automates
 *     description: Update automate by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the workspace of the automate
 *       - in: path
 *         name: automate_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the automate to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               trigger:
 *                 type: int
 *               trigger_option:
 *                  type: string
 *               action:
 *                  type: int
 *               action_option:
 *                  type: string
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown workspace_id or automate_id
 *       406:
 *         description: Method not allowed
 *       500:
 *         description: Error
 *   delete:
 *     tags:
 *       - automates
 *     description: Delete automate by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the workspace of the automate
 *       - in: path
 *         name: automate_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the ID of the automate to delete
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Unknown workspace_id or automate_id
 *       500:
 *         description: Error
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
                    views: automate.views
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
                    workflow: automate.workflow
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
