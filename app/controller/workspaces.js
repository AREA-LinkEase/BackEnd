import { createWorkspace, deleteWorkspace, getAllWorkspaces, getWorkspaceById } from "../model/workspaces.js"

export default function index(app) {
    app.get('/workspaces', async (request, response) => {
        try {
            let json = await getAllWorkspaces()
            return response.status(200).json({result: json})
        } catch(error) {
            return response.status(500).json({error: error})
        }
    })
    app.get('/workspace/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id

        try {
            let json = await getWorkspaceById(workspace_id)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.post('/workspace/', async (request, response) => {
        let body = request.body

        if (body.title === undefined || body.description === undefined || body.is_private === undefined,
            body.users_id === undefined || body.variables === undefined || body.secrets === undefined)
            return response.status(422).json({error: "missing field"})
        try {
            let json = await createWorkspace(
                body.title,
                body.description,
                body.is_private,
                body.users_id,
                body.variables,
                body.secrets
            )
            return response.status(201).json({result: "Workspace created successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.delete('/workspace/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id

        try {
            let json = await deleteWorkspace(workspace_id)
            return response.status(200).json({result: "Workspace deleted successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
}