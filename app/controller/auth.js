import {Conflict, InternalError, NotFound, Unauthorized, UnprocessableEntity} from "../utils/request_error.js";
import {checkPassword, hashPassword} from "../utils/hash_password.js";
import {createDefaultUser, createServiceUser, getUserByEmail, getUserByTiersId, getUserByUsername} from "../model/users.js";
import jwt from "jsonwebtoken";
import { downloadAvatar } from "../utils/download_avatar.js";
import {generateAndSaveImage} from "../utils/generateAndSaveImage.js";


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

/**
 * @swagger
 * /auth/login/discord:
 *   post:
 *     summary: Log in via discord and receive a JWT token
 *     tags: [Authentication]
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
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/login/github:
 *   post:
 *     summary: Log in via GitHub and receive a JWT token
 *     tags: [Authentication]
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
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /auth/login/google:
 *   post:
 *     summary: Log in via Google and receive a JWT token
 *     tags: [Authentication]
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
            let newUser = await createDefaultUser(
                body.username,
                body.email,
                hashed_password,
            )
            await generateAndSaveImage(body.username, newUser.id);
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
    app.get('/auth/login/discord', async (request, response) => {
        let client_id = process.env.DISCORD_CLIENT_ID
        let redirect_uri = process.env.DISCORD_REDIRECT_URI

        response.redirect("https://discord.com/api/oauth2/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=identify%20email")
    })
    app.get('/auth/callback/discord', async (request, response) => {
        let client_id = process.env.DISCORD_CLIENT_ID
        let secret = process.env.DISCORD_SECRET
        let redirect_uri = process.env.DISCORD_REDIRECT_URI
        let code = request.query.code

        const params = new URLSearchParams()
        params.append('client_id', client_id)
        params.append('client_secret', secret)
        params.append('grant_type', 'authorization_code')
        params.append('redirect_uri', redirect_uri)
        params.append('scope', 'identify')
        params.append('code', code)

        try {
            const tokenResult = await fetch('https://discord.com/api/oauth2/token', { method: "POST", body: params })
            if (!tokenResult.ok) return InternalError(response)
            let tokenData = await tokenResult.json()
            let userResult = await fetch('https://discord.com/api/users/@me', {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                },
            })
            if (!userResult.ok) return InternalError(response)
            let userData = await userResult.json()
            let user = await getUserByUsername(userData.username)
            if (user === null) {
                user = await getUserByTiersId(userData.id)
                if (user === null) {
                    user = await createServiceUser(userData.username, userData.email, "discord", userData.id)
                    await downloadAvatar("https://cdn.discordapp.com/avatars/" + userData.id + "/" + userData.avatar, "public/avatars/" + user.id)
                }
            }
            const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.PRIVATE_KEY, {
                expiresIn: '2h',
            });
            return response.status(200).json({jwt: "Bearer " + token})
        } catch (error) {
            InternalError(response)
        }
    })
    app.get('/auth/login/github', async (request, response) => {
        let client_id = process.env.GITHUB_CLIENT_ID
        let redirect_uri = process.env.GITHUB_REDIRECT_URI

        response.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&response_type=code")
    })
    app.get('/auth/callback/github', async (request, response) => {
        let client_id = process.env.GITHUB_CLIENT_ID
        let secret = process.env.GITHUB_SECRET
        let redirect_uri = process.env.GITHUB_REDIRECT_URI
        let code = request.query.code

        const params = new URLSearchParams()
        params.append('client_id', client_id)
        params.append('client_secret', secret)
        params.append('grant_type', 'authorization_code')
        params.append('redirect_uri', redirect_uri)
        params.append('scope', 'user')
        params.append('code', code)

        try {
            const tokenResult = await fetch('https://github.com/login/oauth/access_token', { method: "POST", body: params })
            if (!tokenResult.ok) return InternalError(response)
            const tokenData = await tokenResult.text();
            const tokenParams = new URLSearchParams(tokenData);
            const accessToken = tokenParams.get('access_token');
            let userResult = await fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
            })
            if (!userResult.ok) return InternalError(response)
            let userData = await userResult.json()
            console.log(userData);
            let user = await getUserByUsername(userData.login)
            if (user === null) {
                user = await getUserByTiersId(userData.id)
                if (user === null) {
                    user = await createServiceUser(userData.login, userData.login, "github", userData.id)
                    await downloadAvatar(userData.avatar_url, "public/avatars/" + user.id)
                }
            }
            const token = jwt.sign({ id: user.id, email: user.login, username: user.username }, process.env.PRIVATE_KEY, {
                expiresIn: '2h',
            });
            return response.status(200).json({jwt: "Bearer " + token})
        } catch (error) {
            console.log(error);
            InternalError(response)
        }
    })
    app.get('/auth/login/google', async (request, response) => {
        let client_id = process.env.GOOGLE_CLIENT_ID
        let redirect_uri = process.env.GOOGLE_REDIRECT_URI
        let scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

        response.redirect("https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=" + scope)
    })
    app.get('/auth/callback/google', async (request, response) => {
        let client_id = process.env.GOOGLE_CLIENT_ID
        let secret = process.env.GOOGLE_SECRET
        let redirect_uri = process.env.GOOGLE_REDIRECT_URI
        let code = request.query.code

        const params = new URLSearchParams()
        params.append('client_id', client_id)
        params.append('client_secret', secret)
        params.append('grant_type', 'authorization_code')
        params.append('redirect_uri', redirect_uri)
        params.append('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')
        params.append('code', code)

        try {
            const tokenResult = await fetch('https://oauth2.googleapis.com/token', { method: "POST", body: params })
            if (!tokenResult.ok) return InternalError(response)
            const tokenData = await tokenResult.json();

            let userResult = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                },
            })
            if (!userResult.ok) return InternalError(response)
            let userData = await userResult.json()
            console.log(userData);
            let user = await getUserByUsername(userData.name)
            if (user === null) {
                user = await getUserByTiersId(userData.id)
                if (user === null) {
                    user = await createServiceUser(userData.name, userData.email, "google", userData.id)
                    await downloadAvatar(userData.picture, "public/avatars/" + user.id)
                }
            }
            const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.PRIVATE_KEY, {
                expiresIn: '2h',
            });
            return response.status(200).json({jwt: "Bearer " + token})
        } catch (error) {
            console.log(error);
            InternalError(response)
        }
    })


}