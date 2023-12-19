import { createAutomate, deleteAutomate, getAllAutomates, getAutomateById, updateAutomate } from "../model/automates.js"
import { getWorkspaceById } from "../model/workspaces.js"
import {getUserById} from "../model/users.js";
import { InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js";
import {getServiceByName} from "../model/services.js";
import {REDIRECT_URI} from "./services.js";
import {response} from "express";

async function getAccessToken(refreshToken, nameService, user) {
    const service = await getServiceByName(nameService)
    const query = new URLSearchParams();
    query.append('client_id', service.dataValues.client_id);
    query.append('client_secret', service.dataValues.client_secret);
    query.append('grant_type', 'refresh_token');
    query.append('refresh_token', refreshToken);
    const data = await fetch("https://accounts.spotify.com/api/token", { method: "POST", body: query, headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
    } }).then(response => response.json());
    if ("error" in data) throw "Error with access token"
    return data.access_token;
}

async function triggerCurrentlyPlaying(option, services, user) {
    if (!("spotify" in services)) throw "No spotify service"
    let refresh_token = services.spotify.refresh_token
    let access_token = await getAccessToken(refresh_token, "spotify", user);
    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + access_token
        }
    })
    if (response.status === 204)
        return false;
    let message = await response.json();
    return message.is_playing;
}

async function triggerNotPlaying(option, services, user) {
    return !(await triggerCurrentlyPlaying(option, services, user));
}

async function actionStartMusicSpotify(option, services, user) {
    if (!("spotify" in services)) throw "No spotify service"
    let refresh_token = services.spotify.refresh_token
    let access_token = await getAccessToken(refresh_token, "spotify", user);
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + access_token,
            'Content-Type': 'application/json'
        }
    })
}

async function actionAddMusicToQueueSpotify(option, services, user) {
    if (!("spotify" in services)) throw "No spotify service"
    let refresh_token = services.spotify.refresh_token
    let access_token = await getAccessToken(refresh_token, "spotify", user);
    const response = await fetch("https://api.spotify.com/v1/me/player/queue?uri=" + encodeURIComponent(option), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + access_token
        }
    })
}

const triggers = [
    triggerNotPlaying,
    triggerCurrentlyPlaying
]
const actions = [
    actionStartMusicSpotify,
    actionAddMusicToQueueSpotify
]

setInterval(async () => {
    let automates = await getAllAutomates()

    for (const automate of automates) {
        let trigger = automate.dataValues.trigger
        let triggerOption = automate.dataValues.trigger_option
        let action = automate.dataValues.action
        let actionOption = automate.dataValues.action_option

        if (trigger === -1 || trigger >= triggers.length) continue;
        if (action === -1 || action >= actions.length) continue;

        let workspace = await getWorkspaceById(automate.dataValues.workspace_id)

        if (!workspace) continue;

        let logs = JSON.parse(automate.dataValues.logs);
        let users_id = workspace.dataValues.users_id;

        for (const user_id of users_id) {
            let user = await getUserById(user_id);

            if (!user) {
                logs.push({"type": "warning", "message": "A user doesn't exist"})
                continue;
            }

            let services = JSON.parse(user.dataValues.services);

            if (!services) {
                logs.push({"type": "error", "message": "A user doesn't setup services"})
                continue;
            }

            try {
                let triggerResult = await triggers[trigger](triggerOption, services, user);
                if (triggerResult) {
                    let actionResult = await actions[action](actionOption, services, user);
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
     *   get:
     *     tags:
     *       - automates
     *     description: Get all automates
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
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
     *       404:
     *         description: Unknown workspace_id
     *       422:
     *         description: Missing field
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
     *       404:
     *         description: Unknown workspace_id or automate_id
     *       500:
     *         description: Error
     */

    app.post('/automates/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let body = request.body

        if (body.title === undefined || body.workspace_id === undefined || body.workflow === undefined,
            body.variables === undefined || body.secrets === undefined)
            return UnprocessableEntity(response)
        let workspace = await getWorkspaceById(workspace_id)
        if (workspace === null)
            return NotFound(response)
        try {
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
        let workspace_id = request.params.workspace_id
        let automate_id = request.params.automate_id
        let body = request.body
    
        let workspace = await getWorkspaceById(workspace_id)
        if (workspace === null)
            return NotFound(response)
        try {
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
        let automate_id = request.params.automate_id
        let workspace_id = request.params.workspace_id

        let workspace = getWorkspaceById(workspace_id)
        if (workspace === null)
            return NotFound(response)
        try {
            let error = await deleteAutomate(automate_id)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "Automate deleted successfully"})
        } catch (error) {
            InternalError(response)
        }
    })
}