import {createWorkspace, getAllWorkspaces, getWorkspaceById, searchWorkspaces} from "../model/workspaces.js"
import {createAutomate, getAutomatesByWorkspace} from "../model/automates.js"
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js"
import {getUserById} from "../model/users.js";

/**
 * @openapi
 * /workspaces:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Get all workspaces linked to you
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 *   post:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Create a new workspace
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               is_private:
 *                 type: boolean
 *               users_id:
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
 *       422:
 *         description: Unprocessable Entity
 *       500:
 *         description: Internal Server Error
 * /workspaces/{workspace_id}:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Get workspace by id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal Server Error
 *   put:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Modify workspace's name by id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to modify
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Delete workspace by id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to delete
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal Server Error
 * /workspaces/private:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Get all private workspaces
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 * /workspaces/public:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Get all public workspaces
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 * /workspaces/{workspace_id}/enable/{enabled}:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Set workspace's enable parameter by workspace id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *       - in: path
 *         name: enabled
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Enable state to apply
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       422:
 *         description: Unprocessable entity
 *       500:
 *         description: Internal Server Error
 * /workspaces/{workspace_id}/variables:
 *   get:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Get workspace's variables by workspace id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal Server Error
 *   post:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Create or modify variable in workspace
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name_of_the_variable:
 *                 type: all
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal Server Error
 * /workspaces/{workspace_id}/variables/{variable_name}:
 *   delete:
 *     tags:
 *       - workspaces
 *     security:
 *       - bearerAuth: []
 *     description: Delete variable in workspace
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *       - in: path
 *         name: variable_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Variable name to delete
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Workspace not found
 *       422:
 *         description: Unprocessable entity
 *       500:
 *         description: Internal Server Error
 * /workspaces/:workspace_id/users/:user_id:
 *   get:
 *     tags:
 *       - workspaces
 *     description: Add a user by id in a workspace by id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User's ID to add
 *   delete:
 *     tags:
 *       - workspaces
 *     description: Delete a user by id in a workspace by id
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace's ID to get
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User's ID to delete
 */

export default function index(app) {
    app.get('/workspaces/@me/private', async (request, response) => {
        try {
            let workspaces = await getAllWorkspaces(response.locals.user.id)
            let results = [];

            for (const workspace of workspaces) {
                if (workspace.is_private)
                    results.push(workspace.toJSON())
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/workspaces/@me/public', async (request, response) => {
        try {
            let workspaces = await getAllWorkspaces(response.locals.user.id)
            let results = [];

            for (const workspace of workspaces) {
                if (!workspace.is_private)
                    results.push(workspace.toJSON())
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/workspaces/@me', async (request, response) => {
        try {
            let workspaces = await getAllWorkspaces(response.locals.user.id)
            let results = [];

            for (const workspace of workspaces) {
                results.push(workspace.toJSON())
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
    app.post('/workspaces/@me', async (request, response) => {
        try {
            let body = request.body;

            if (!['title', 'description', 'is_private', 'users_id'].every((property) => body[property] !== undefined))
                return UnprocessableEntity(response)
            if (!['title', 'description'].every((property) => typeof body[property] === "string"))
                return UnprocessableEntity(response)
            if (typeof body['is_private'] !== "boolean")
                return UnprocessableEntity(response)
            if (!Array.isArray(body['users_id']))
                return UnprocessableEntity(response)

            await createWorkspace(body['title'], body['description'], body['is_private'], body['users_id'], response.locals.user.id)
            return response.status(200).json({result: "Workspace has created successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.post('/workspaces/:id/variables/:name', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let name = request.params.name
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            let body = request.body
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            if (!("content" in body) || typeof body["content"] !== "string")
                return UnprocessableEntity(response)
            let variables = workspace.variables;
            variables[name] = body["content"]
            workspace.update({variables})
            return response.status(200).json({result: "Workspace has been updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.delete('/workspaces/:id/variables/:name', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let name = request.params.name
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            let variables = workspace.variables;
            delete variables[name]
            workspace.update({variables})
            return response.status(200).json({result: "Workspace has been updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.delete('/workspaces/:id/users/:user_id', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let other_user_id = parseInt(request.params.user_id)
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            let users_id = workspace.users_id;
            users_id = users_id.filter(userId => userId.id !== other_user_id)
            workspace.update({users_id})
            return response.status(200).json({result: "Workspace has been updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.post('/workspaces/:id/users', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            let body = request.body
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            if (!("permission" in body) || !("id" in body) || typeof body.permission !== "number" || typeof body.id !== "number")
                return UnprocessableEntity(response)
            if (body.permission < 0 || body.permission > 3)
                return UnprocessableEntity(response)
            let user = await getUserById(body.id)
            if (user === null)
                return NotFound(response)
            let users_id = workspace.users_id;
            users_id = users_id.filter(userId => userId.id !== body.id)
            users_id.push({id: body.id, permission: body.permission})
            workspace.update({users_id})
            return response.status(200).json({result: "Workspace has been updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.post('/workspaces/:id/automate', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            let body = request.body
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id))
                return Forbidden(response)
            if (!['title', 'is_private'].every((property) => body[property] !== undefined))
                return UnprocessableEntity(response)
            if (typeof body['title'] !== "string")
                return UnprocessableEntity(response)
            if (typeof body['is_private'] !== "boolean")
                return UnprocessableEntity(response)
            await createAutomate(body['title'], body['is_private'], workspace_id)
            return response.status(200).json({result: "Automate has been created successfully"})
        } catch(error) {
            console.log(error)
            InternalError(response)
        }
    })
    app.get('/workspaces/:id', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id))
                return Forbidden(response)
            let automates = await getAutomatesByWorkspace(workspace_id)
            return response.status(200).json({
                ...workspace.toJSON(),
                automates
            })
        } catch(error) {
            InternalError(response)
        }
    })
    app.put('/workspaces/:id', async (request, response) => {
        try {
            let workspace_id = parseInt(request.params.id)
            let workspace = await getWorkspaceById(workspace_id)
            let user_id = response.locals.user.id
            let body = request.body
            if (workspace === null)
                return NotFound(response)
            if (workspace.is_private && workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 1))
                return Forbidden(response)
            if (!Object.keys(body).every((value) => ["title", "description", "is_private", "is_enabled"].includes(value)))
                return UnprocessableEntity(response)
            workspace.update(body)
            return response.status(200).json({result: "Workspace has been updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/workspaces/search/:input', async (request, response) => {
        try {
            let input = request.params.input
            let workspaces = await searchWorkspaces(input)
            let results = [];

            for (const workspace of workspaces) {
                if (workspace.is_private) continue;
                results.push({
                    id: workspace.id,
                    title: workspace.title,
                    description: workspace.description,
                    owner_id: workspace.owner_id,
                    views: workspace.views
                })
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
}
