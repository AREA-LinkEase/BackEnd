import {
    createUser,
    deleteUser,
    getAllUsers,
    getIdByUsername,
    getSelf,
    getUserByEmail,
    getUserById,
    getUserByUsername,
    searchUser,
    updateUser
} from "../model/users.js"
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
    app.get('/users/@me', async (request, response) => {
        try {
            return response.status(200).json(response.locals.user)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.put('/users/@me', async (request, response) => {
        try {
            let body = request.body

            if (body === undefined)
                return UnprocessableEntity(response)
            if (body.password)
                body.password = await hashPassword(body.password)
            let error = await updateUser(response.locals.user.id, body)
            if (error)
                return NotFound(response)
            return response.status(200).json({result: "User changed successfully"})
        } catch (error) {
            console.log(error)
            return InternalError(response)
        }
    })
    app.get('/users/@me/friends', async (request, response) => {
        try {
            let friends = response.locals.user.friends
            let results = [];

            for (const friend of friends) {
                let user = await getUserById(friend);

                if (user === null) continue;
                results.push({
                    id: user.id,
                    username: user.username,
                    email: user.email
                })
            }
            return response.status(200).json(results)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.post('/users/@me/friends', async (request, response) => {
        let body = request.body;

        if (body === undefined) return UnprocessableEntity(response);

        let newFriends = body.friends;

        if (newFriends === undefined || !Array.isArray(newFriends)) return UnprocessableEntity;

        let friends = response.locals.user.friends

        friends = [...friends, ...newFriends]

        await updateUser(response.locals.user.id, {friends})

        return response.status(200).json({result: "User changed successfully"})
    })
    app.delete('/users/@me/friends/:user_id', async (request, response) => {
        let userId = parseInt(request.params.user_id);

        if (userId === undefined || isNaN(userId)) return UnprocessableEntity(response);

        let friends = response.locals.user.friends

        if (friends.includes(userId)) {
            friends.splice(friends.indexOf(userId), 1)
            await updateUser(response.locals.user.id, {friends})
        } else {
            return NotFound(response)
        }
        return response.status(200).json({result: "User changed successfully"})
    })
    app.get('/users/search/:input', async (request, response) => {
        try {
            let input = request.params.input;
            let users = await searchUser(input);
            let results = [];

            for (const user of users) {
                results.push({
                    id: user.id,
                    username: user.username,
                    email: user.email
                })
            }
            return response.status(200).json(results)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/users/:user_id', async (request, response) => {
        try {
            let userId = parseInt(request.params.user_id);
            let user = await getUserById(userId);

            if (user === null) return NotFound(response)
            return response.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email
            })
        } catch (error) {
            return InternalError(response)
        }
    })
}