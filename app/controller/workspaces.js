import {
  createWorkspace,
  getAllPublicWorkspaces,
  getAllWorkspaces,
  getWorkspaceById,
  searchWorkspaces
} from "../model/workspaces.js"
import {createAutomate, getAutomatesByWorkspace} from "../model/automates.js"
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js"
import {getUserById} from "../model/users.js";

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspaces management
 */


/**
 * @swagger
 * /workspaces/@me/private:
 *   get:
 *     summary: Get private workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /workspaces/@me/public:
 *   get:
 *     summary: Get public workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /workspaces/@me:
 *   get:
 *     summary: Get all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /workspaces/@me:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Workspace details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkspaceCreate'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error422'
 */

/**
 * @swagger
 * /workspaces/{id}/variables/{name}:
 *   post:
 *     summary: Update or create a variable in a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *       - in: path
 *         name: name
 *         description: Variable name
 *         required: true
 *         type: string
 *       - in: body
 *         name: body
 *         description: Variable content
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VariableUpdate'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error422'
 */

/**
 * @swagger
 * /workspaces/{id}/variables/{name}:
 *   delete:
 *     summary: Delete a variable in a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *       - in: path
 *         name: name
 *         description: Variable name
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */

/**
 * @swagger
 * /workspaces/{id}/users/{user_id}:
 *   delete:
 *     summary: Remove a user from a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *       - in: path
 *         name: user_id
 *         description: User ID to be removed
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */

/**
 * @swagger
 * /workspaces/{id}/users:
 *   post:
 *     summary: Add a user to a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: User details to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserAdd'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error422'
 */

/**
 * @swagger
 * /workspaces/{id}/automate:
 *   post:
 *     summary: Create a new automate in a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Automate details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutomateCreate'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error422'
 */

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get details of a workspace with automates
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceWithAutomates'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 */

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Update details of a workspace
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Workspace ID
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Workspace details to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkspaceUpdate'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error422'
 */

/**
 * @swagger
 * /workspaces/search/{input}:
 *   get:
 *     summary: Search for workspaces based on input
 *     tags: [Workspaces]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: input
 *         description: Search input
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkspaceSearchResult'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Workspace:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         color:
 *           type: string
 *         description:
 *           type: string
 *         is_private:
 *           type: boolean
 *         owner_id:
 *           type: integer
 *         users_id:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               permission:
 *                 type: integer
 *         variables:
 *           type: object
 *         views:
 *           type: integer
 *         is_enabled:
 *           type: boolean
 *     WorkspaceCreate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         color:
 *           type: string
 *         description:
 *           type: string
 *         is_private:
 *           type: boolean
 *         users_id:
 *           type: array
 *           items:
 *             type: integer
 *     VariableUpdate:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *     UserAdd:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         permission:
 *           type: integer
 *     AutomateCreate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         is_private:
 *           type: boolean
 *     WorkspaceWithAutomates:
 *       allOf:
 *         - $ref: '#/components/schemas/Workspace'
 *         - type: object
 *           properties:
 *             automates:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Automate'
 *     WorkspaceUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         color:
 *           type: string
 *         description:
 *           type: string
 *         is_private:
 *           type: boolean
 *         is_enabled:
 *           type: boolean
 *     WorkspaceSearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         color:
 *           type: string
 *         description:
 *           type: string
 *         owner_id:
 *           type: integer
 *         views:
 *           type: integer
 *     Error404:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Not Found
 *     Error422:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Unprocessable Entity
 *   errors:
 *     Error404:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Not Found
 *     Error422:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Unprocessable Entity
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
    app.get('/workspaces/@all', async (request, response) => {
      try {
        let workspaces = await getAllPublicWorkspaces()
        let results = [];

        for (const workspace of workspaces) {
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 3))
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 3))
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 2))
                return Forbidden(response)
            if (!['title', 'is_private'].every((property) => body[property] !== undefined))
                return UnprocessableEntity(response)
            if (typeof body['title'] !== "string" || typeof body['description'] !== "string")
                return UnprocessableEntity(response)
            if (typeof body['is_private'] !== "boolean")
                return UnprocessableEntity(response)
            await createAutomate(body['title'], body['description'], body['is_private'], workspace_id)
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
            if (workspace.owner_id !== user_id &&
                workspace.users_id.every(user => user.id !== user_id && user.permission < 3))
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
                results.push(workspace.toJSON())
            }
            return response.status(200).json(results)
        } catch(error) {
            InternalError(response)
        }
    })
}
