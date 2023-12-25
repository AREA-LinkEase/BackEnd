import {getAutomateById} from "../model/automates.js";
import {InternalError, NotFound} from "../utils/request_error.js";
import {getWorkspaceById} from "../model/workspaces.js";
import {getUserById} from "../model/users.js";

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
            for (const user_id of workspace.users_id)
                users.push(await getUserById(user_id))

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
}