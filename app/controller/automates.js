import { createAutomate, deleteAutomate, getAllAutomates, getAutomateById, getAutomatesByWorkpace, updateAutomate } from "../model/automates.js"
import { getWorkspaceById } from "../model/workspaces.js"
import {getUserById} from "../model/users.js";
import { Forbidden, InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js";
import { getPayload } from "../utils/get_payload.js";

const triggers = []
const actions = []

setInterval(async () => {
    let automates = await getAllAutomates()

    for (const automate of automates) {
        let trigger = automate.dataValues.trigger
        let triggerOption = automate.dataValues.trigger_option
        let action = automate.dataValues.action
        let actionOption = automate.dataValues.action_option

        if (trigger === -1 || !trigger || trigger >= triggers.length) continue;
        if (action === -1 || !action || action >= actions.length) continue;


        let workspace = await getWorkspaceById(automate.dataValues.workspace_id)

        if (!workspace) continue;

        let logs = automate.dataValues.logs;
        let users_id = workspace.dataValues.users_id;

        for (const user_id of users_id) {
            let user = await getUserById(user_id);

            if (!user) {
                logs.push({"type": "warning", "message": "A user doesn't exist"})
                continue;
            }

            let services = user.dataValues.services;

            if (!services) {
                logs.push({"type": "error", "message": "A user doesn't setup services"})
                continue;
            }

            try {
                let triggerResult = await triggers[trigger](triggerOption, services);
                if (triggerResult) {
                    let actionResult = await actions[action](actionOption, services);
                    logs.push({"type": "success", "message": actionResult});
                }
            } catch (e) {
                logs.push({"type": "error", "message": e})
            }
        }
        await automate.update(logs)
    }
}, 5000)

export default function index(app) {

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

    app.get('/automates/:workspace_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let workspace_id = request.params.workspace_id

        try {
            let workspace = await getWorkspaceById(workspace_id, payload.id)
            if (workspace === 404)
                return NotFound(response)
            else if (workspace === 403)
                return Forbidden(response)
            console.log(workspace);
            let json = await getAutomatesByWorkpace(workspace_id)
            return response.status(200).json({result: json})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.get('/automates/:workspace_id/:automate_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let workspace_id = request.params.workspace_id
        let automate_id = request.params.automate_id

        try {
            let workspace = await getWorkspaceById(workspace_id, payload.id)
            if (workspace === 404)
                return NotFound(response)
            else if (workspace === 403)
                return Forbidden(response)
            let json = await getAutomateById(automate_id)
            if (json === null)
                return NotFound(response)
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.post('/automates/:workspace_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let workspace_id = request.params.workspace_id
        let body = request.body

        if (body.title === undefined || body.workspace_id === undefined || body.workflow === undefined,
            body.variables === undefined || body.secrets === undefined)
            return UnprocessableEntity(response)
        try {
            let workspace = await getWorkspaceById(workspace_id, payload.id)
            if (workspace === 404)
                return NotFound(response)
            else if (workspace === 403)
                return Forbidden(response)
            await createAutomate(
                body.title,
                workspace_id,
                body.workflow,
                body.variables,
                body.secrets
            )
            return response.status(201).json({result: "Automate created successfully"})
        } catch (error) {
            InternalError(response)
        }
    })
    app.get('/automates/:workspace_id/:automate_id', async (request, response) => {
        let automate_id = request.params.automate_id
        let workspace_id = request.params.workspace_id

        let workspace = await getWorkspaceById(workspace_id)
        if (workspace === null)
            return NotFound(response)
        try {
            let json = await getAutomateById(automate_id)
            if (json === null)
                return NotFound(response)
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/automates', async (request, response) => {
        try {
            let json = await getAllAutomates()
            return response.status(200).json({result: json})
        } catch(error) {
            return InternalError(response)
        }
    })
    app.put('/automates/:workspace_id/:automate_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let workspace_id = request.params.workspace_id
        let automate_id = request.params.automate_id
        let body = request.body
    
        try {
            let workspace = await getWorkspaceById(workspace_id, payload.id)
            if (workspace === 404)
                return NotFound(response)
            else if (workspace === 403)
                return Forbidden(response)
            if (Object.keys(body).every((value) => ["title", "action_option", "action", "trigger", "trigger_option"].includes(value)))
                response.status(406).json({result: "Method Not Allowed"})
            let error = await updateAutomate(automate_id, body)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.delete('/automates/:workspace_id/:automate_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let automate_id = request.params.automate_id
        let workspace_id = request.params.workspace_id

        try {
            let workspace = await getWorkspaceById(workspace_id, payload.id)
            if (workspace === 404)
                return NotFound(response)
            else if (workspace === 403)
                return Forbidden(response)
            let error = await deleteAutomate(automate_id)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "Automate deleted successfully"})
        } catch (error) {
            InternalError(response)
        }
    })
}