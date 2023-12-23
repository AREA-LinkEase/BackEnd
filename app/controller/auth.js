import {Conflict, InternalError, NotFound, Unauthorized, UnprocessableEntity} from "../utils/request_error.js";
import {checkPassword, hashPassword} from "../utils/hash_password.js";
import {createDefaultUser, getUserByEmail, getUserByUsername} from "../model/users.js";
import jwt from "jsonwebtoken";


/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - users
 *     description: Login
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
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable Entity
 *       500:
 *         description: Internal Server Error
 * /auth/register:
 *   post:
 *     tags:
 *       - users
 *     description: Create a new user
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
 *       201:
 *         description: Success
 *       409:
 *         description: Username or email already taken
 *       422:
 *         description: Unprocessable Entity
 *       500:
 *         description: Internal Server Error
 */

export default function index(app) {
    app.post('/auth/register', async (request, response) => {
        let body = request.body

        if (body.username === undefined || body.email === undefined || body.password === undefined)
            return UnprocessableEntity(response)
        try {
            let user = await getUserByEmail(body.email)
            if (user) return Conflict(response)
            user = await getUserByUsername(body.username)
            if (user) return Conflict(response)
            let hashed_password = await hashPassword(body.password)
            await createDefaultUser(
                body.username,
                body.email,
                hashed_password,
            )
            return response.status(201).json({result: "User created successfully"})
        } catch (error) {
            InternalError(response)
        }
    })
    app.post('/auth/login', async (request, response) => {
        let identifiable = request.body.username
        let plainPassword = request.body.password

        if (identifiable === undefined || plainPassword === undefined)
            return UnprocessableEntity(response)
        try {
            let user = await getUserByUsername(identifiable)
            if (user === null)
                user = await getUserByEmail(identifiable)
            if (user === null)
                return NotFound(response)
            let isValidPassword = await checkPassword(plainPassword, user.dataValues.password)
            if (isValidPassword === true) {
                const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.PRIVATE_KEY, {
                    expiresIn: '2h',
                });
                return response.status(200).json({jwt: "Bearer " + token})
            } else
                return Unauthorized(response)
        } catch (error) {
            InternalError(response)
        }
    })
}