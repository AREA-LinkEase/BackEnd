import {
    getUserById,
    searchUser,
    updateUser
} from "../model/users.js"
import { hashPassword } from "../utils/hash_password.js"
import { InternalError, NotFound, UnprocessableEntity } from "../utils/request_error.js"

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/@me:
 *   get:
 *     summary: Get the authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

/**
 * @swagger
 * /users/@me:
 *   put:
 *     summary: Update the authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: User data to be updated
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             example:
 *               password: newPassword
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Result message
 *             example:
 *               result: User changed successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '422':
 *         description: Unprocessable Entity
 */

/**
 * @swagger
 * /users/@me/friends:
 *   get:
 *     summary: Get the authenticated user's friends
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

/**
 * @swagger
 * /users/@me/friends:
 *   post:
 *     summary: Add friends to the authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: List of friends to add
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friends:
 *                 type: array
 *                 items:
 *                   type: integer
 *             example:
 *               friends: [2, 5, 8]
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Result message
 *             example:
 *               result: User changed successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '422':
 *         description: Unprocessable Entity
 */

/**
 * @swagger
 * /users/@me/friends/{user_id}:
 *   delete:
 *     summary: Remove a friend from the authenticated user's list
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the friend to be removed
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Result message
 *             example:
 *               result: User changed successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '422':
 *         description: Unprocessable Entity
 *       '404':
 *         description: Not Found
 */

/**
 * @swagger
 * /users/search/{input}:
 *   get:
 *     summary: Search users by email or username
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: input
 *         required: true
 *         description: Search input (email or username)
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user to be retrieved
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         username:
 *           type: string
 *           description: User username
 *         email:
 *           type: string
 *           description: User email
 *       required:
 *         - id
 *         - username
 *         - email
 */

export default function index(app) {
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