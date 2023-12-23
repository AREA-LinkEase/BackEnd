import { createUser, deleteUser, getAllUsers, getIdByUsername, getSelf, getUserByEmail, getUserById, getUserByUsername, updateUser } from "../model/users.js"
import { checkPassword, hashPassword } from "../utils/hash_password.js"
import jwt from "jsonwebtoken"
import { Forbidden, InternalError, NotFound, Unauthorized, UnprocessableEntity } from "../utils/request_error.js"
import { getPayload } from "../utils/get_payload.js"

export default function index(app) {

    /**
     * @openapi
     * /users:
     *   get:
     *     tags:
     *       - users
     *     security:
     *       - bearerAuth: []
     *     description: Get all users
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Internal Server Error
     * /users/{user_id}:
     *   get:
     *     tags:
     *       - users
     *     security:
     *       - bearerAuth: []
     *     description: Get user by id
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: the ID of the user to get
     *     responses:
     *       200:
     *         description: Success
     *       404:
     *         description: Unknown user
     *       500:
     *         description: Internal Server Error
     *   put:
     *     tags:
     *       - users
     *     security:
     *       - bearerAuth: []
     *     description: Update user by ID
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: the ID of the user to update
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Success
     *       403:
     *         description: Forbidden Request
     *       404:
     *         description: Unknown workspace_id or automate_id
     *       422:
     *         description: Unprocessable Entity
     *       500:
     *         description: Error
     *   delete:
     *     tags:
     *       - users
     *     security:
     *       - bearerAuth: []
     *     description: Delete user by id
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: the ID of the user to delete
     *     responses:
     *       200:
     *         description: Success
     *       404:
     *         description: Unknown user
     *       500:
     *         description: Internal Server Error
     */
    app.get('/users/self', async (request, response) => {
        let payload = getPayload(request.headers.authorization)

        try {
            const json = await getSelf(payload.id)
            if (json === null)
                return NotFound(response)
            return response.status(200).json({result: json})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/users/username/:username', async (request, response) => {
        let username = request.params.username

        try {
            let json = await getIdByUsername(username)
            if (json === null)
                return NotFound(response)
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/users/:user_id', async (request, response) => {
        let user_id = request.params.user_id

        try {
            let json = await getUserById(user_id)
            if (json === null)
                return NotFound(response)
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.get('/users', async (request, response) => {
        try {
            let json = await getAllUsers()
            return response.status(200).json({result: json})
        } catch(error) {
            InternalError(response)
        }
    })
    app.put('/users/:user_id', async (request, response) => {
        let payload = getPayload(request.headers.authorization)
        let user_id = request.params.user_id
        let body = request.body

        if (user_id === undefined || body === undefined)
            return UnprocessableEntity(response)
        if (user_id !== payload.id)
            return Forbidden(response)
        if (body.password)
            body.password = await hashPassword(body.password)
        try {
            let error = await updateUser(user_id, body)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "User changed successfully"})
        } catch(error) {
            InternalError(response)
        }
    })
    app.delete('/users/:user_id', async (request, response) => {
        let user_id = request.params.user_id
        let payload = getPayload(request.headers.authorization)

        if (user_id !== payload.id)
            return Forbidden(response)
        try {
            let error = await deleteUser(user_id)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "User deleted successfully"})
        } catch (error) {
            console.log(error);
            InternalError(response)
        }
    })
}