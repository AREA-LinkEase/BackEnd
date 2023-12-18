import { createWorkspace, deleteWorkspace, getAllWorkspaces, getWorkspaceById, getWorkspaceByPrivacy, getWorkspaceVariables, updateWorkspace } from "../model/workspaces.js"
import { getAutomatesByWorkpace } from "../model/automates.js"
import { getPayload } from "../utils/get_payload.js"
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js"

export default function index(app) {

    /**
     * @openapi
     * /workspaces:
     *   get:
     *     tags:
     *       - workspaces
     *     description: Get all workspaces
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     *   post:
     *     tags:
     *       - workspaces
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
     *         description: Missing field
     *       500:
     *         description: Error
     * /workspaces/{workspace_id}:
     *   get:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     *   put:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     *   delete:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     * /workspaces/private:
     *   get:
     *     tags:
     *       - workspaces
     *     description: Get all private workspaces
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /workspaces/public:
     *   get:
     *     tags:
     *       - workspaces
     *     description: Get all public workspaces
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /workspaces/{workspace_id}/enable/{enabled}:
     *   get:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     * /workspaces/{workspace_id}/variables:
     *   get:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     *   post:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     * /workspaces/{workspace_id}/variables/{variable_name}:
     *   delete:
     *     tags:
     *       - workspaces
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
     *       500:
     *         description: Error
     */

    app.get('/workspaces/private', async (request, response) => {
        try {
            let json = await getWorkspaceByPrivacy(true)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.get('/workspaces/public', async (request, response) => {
        try {
            let json = await getWorkspaceByPrivacy(false)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.get('/workspaces', async (request, response) => {
        try {
            let json = await getAllWorkspaces()
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/workspaces/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id

        try {
            let automates = await getAutomatesByWorkpace(workspace_id)
            let json = await getWorkspaceById(workspace_id)
            if (automates === null || json === null)
                return NotFound(response)
            return response.status(200).json({result: { ...json.toJSON(), automates: automates }})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.post('/workspaces', async (request, response) => {
        let body = request.body
        let payload = getPayload(request.headers.token)

        if (body.title === undefined || body.description === undefined || body.is_private === undefined)
            return UnprocessableEntity(response)
        try {
            let users_id = JSON.parse('{"ids": [' + payload.id + ']}')

            await createWorkspace(
                body.title,
                body.description,
                body.is_private,
                users_id
            )
            return response.status(201).json({result: "Workspace created successfully"})
        } catch (error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.delete('/workspaces/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id

        try {
            await deleteWorkspace(workspace_id)
            return response.status(200).json({result: "Workspace deleted successfully"})
        } catch (error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.put('/workspaces/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let body = request.body
        try {
            await updateWorkspace(workspace_id, body)
            return response.status(200).json({result: "Workspace's name changed successfully"})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.get('/workspaces/:workspace_id/enable/:enabled', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let enabled = request.params.enabled
        try {
            await updateWorkspace(workspace_id, { enabled: enabled })
            return response.status(200).json({result: "Workspace's enabled parameter changed successfully"})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.get('/workspaces/:workspace_id/variables', async (request, response) => {
        let workspace_id = request.params.workspace_id
        try {
            let json = await getWorkspaceVariables(workspace_id)
            return response.status(200).json({result: json.variables})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.post('/workspaces/:workspace_id/variables', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let body = request.body
        try {
            let workspace = await getWorkspaceById(workspace_id)
            await updateWorkspace(workspace_id, { variables: { ...workspace.variables, ...body }})
            return response.status(200).json({result: "Workspace's variable created successfully"})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.delete('/workspaces/:workspace_id/variables/:variable_name', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let variable_name = request.params.variable_name
        try {
            let workspace = await getWorkspaceById(workspace_id)
            delete workspace.variables[variable_name]
            await updateWorkspace(workspace_id, { variables: { ...workspace.variables }})
            return response.status(200).json({result: "Workspace's variable deleted successfully"})
        } catch(error) {
            console.log(error);
            InternalError(response)
        }
    })
}