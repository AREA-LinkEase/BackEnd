import {Conflict, InternalError, NotFound, Unauthorized, UnprocessableEntity} from "../utils/request_error.js";
import {checkPassword, hashPassword} from "../utils/hash_password.js";
import {createDefaultUser, getUserByEmail, getUserByUsername} from "../model/users.js";
import jwt from "jsonwebtoken";


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       409:
 *         description: Conflict - User with the same username or email already exists
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       description: User login credentials
 *       required: true
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
 *         description: Bearer token for successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:
 *                   type: string
 *       400:
 *         description: Bad Request - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       404:
 *         description: Not Found - User not found
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