import { createAutomate, deleteAutomate, getAllAutomates, getAutomateById } from "../model/automates.js"

export default function index(app) {

    /**
     * @openapi
     * /automates:
     *   get:
     *     description: Get all automates
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /automate:
     *   post:
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
     * /automate/{automate_id}:
     *   get:
     *     description: Get automate by id
     *     parameters:
     *       - in: path
     *         name: automate_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de l'automate à récupérer
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /deleteautomate/{automate_id}:
     *   delete:
     *     description: Delete automate by id
     *     parameters:
     *       - in: path
     *         name: automate_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de l'automate à supprimer
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
    app.get('/automate/:automate_id', async (request, response) => {
        let automate_id = request.params.automate_id

        try {
            let json = await getAutomateById(automate_id)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.post('/automate/', async (request, response) => {
        let body = request.body

        if (body.title === undefined || body.workspace_id === undefined || body.workflow === undefined,
            body.variables === undefined || body.secrets === undefined)
            return response.status(422).json({error: "missing field"})
        try {
            let json = await createAutomate(
                body.title,
                body.workspace_id,
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
    app.delete('/deleteautomate/:automate_id', async (request, response) => {
        let automate_id = request.params.automate_id

        try {
            let json = await deleteAutomate(automate_id)
            return response.status(200).json({result: "Automate deleted successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
}