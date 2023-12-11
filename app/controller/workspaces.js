import { createWorkspace, deleteWorkspace, getAllWorkspaces, getWorkspaceById } from "../model/workspaces.js"

export default function index(app) {

    /**
     * @openapi
     * /workspaces:
     *   get:
     *     description: Get all workspaces
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /workspace:
     *   post:
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
     * /workspace/{workspace_id}:
     *   get:
     *     description: Get workspace by id
     *     parameters:
     *       - in: path
     *         name: workspace_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID du workspace à récupérer
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /deleteworkspace/{workspace_id}:
     *   delete:
     *     description: Delete workspace by id
     *     parameters:
     *       - in: path
     *         name: automate_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID du workspace à supprimer
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     */

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
    app.post('/workspace', async (request, response) => {
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
    app.delete('/deleteworkspace/:workspace_id', async (request, response) => {
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