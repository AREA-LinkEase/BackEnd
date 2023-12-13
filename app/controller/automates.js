import { createAutomate, deleteAutomate, getAllAutomates, getAutomateById, updateAutomate } from "../model/automates.js"
import { getWorkspaceById } from "../model/workspaces.js"

export default function index(app) {

    /**
     * @openapi
     * /automates:
     *   get:
     *     tags:
     *       - automates
     *     description: Get all automates
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     *   post:
     *     tags:
     *       - automates
     *     description: Create a new automate
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
     *       422:
     *         description: Missing field
     *       500:
     *         description: Error
     * /automates/{workspace_id}/{automate_id}:
     *   get:
     *     tags:
     *       - automates
     *     description: Get automate by id
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
     *       500:
     *         description: Error
     *   put:
     *     tags:
     *       - automates
     *     description: Update automate by ID
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
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     *   delete:
     *     tags:
     *       - automates
     *     description: Delete automate by id
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
     *       500:
     *         description: Error
     */

    app.get('/automates', async (request, response) => {
        try {
            let json = await getAllAutomates()
            return response.status(200).json({result: json})
        } catch(error) {
            return response.status(500).json({error: error})
        }
    })
    app.get('/automates/:workspace_id/:automate_id', async (request, response) => {
        let automate_id = request.params.automate_id
        let workspace_id = request.params.workspace_id

        let workspace = await getWorkspaceById(workspace_id)
        if (workspace === null)
            return response.status(404).json({error: "Unkwnown workspace"})
        try {
            let json = await getAutomateById(automate_id)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.post('/automates/:workspace_id', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let body = request.body

        if (body.title === undefined || body.workspace_id === undefined || body.workflow === undefined,
            body.variables === undefined || body.secrets === undefined)
            return response.status(422).json({error: "missing field"})
        let workspace = await getWorkspaceById(workspace_id)
        console.log(workspace);
        if (workspace === null)
            return response.status(404).json({error: "unknown workspace"})
        try {
            let json = await createAutomate(
                body.title,
                workspace_id,
                body.workflow,
                body.variables,
                body.secrets
            )
            return response.status(201).json({result: "Automate created successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.put('/automates/:workspace_id/:automate_id', async (request, response) => {
        let workspace_id = request.params.workspace_id
        let automate_id = request.params.automate_id
        let body = request.body
    
        let workspace = await getWorkspaceById(workspace_id)
        if (workspace === null)
            return response.status(404).json({error: "unknown workspace"})
        try {
            let json = await updateAutomate(automate_id, body)
            return response.status(200).json({result: "Automate updated successfully"})
        } catch(error) {
            console.log(error);
            //TODO faire une erreur custom
            // if (error === "Workspace ID cannot be updated.")
            //     return response.status(222).json({error: "workspace_id can't be updated"})
            return response.status(500).json({error: error})
        }
    })
    app.delete('/automates/:workspace_id/:automate_id', async (request, response) => {
        let automate_id = request.params.automate_id
        let workspace_id = request.params.workspace_id

        let workspace = getWorkspaceById(workspace_id)
        if (workspace === null)
            return response.statsu(404).json({error: "Unknown workspace"})
        try {
            let json = await deleteAutomate(automate_id)
            return response.status(200).json({result: "Automate deleted successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
}