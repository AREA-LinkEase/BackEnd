import { createUser, deleteUser, getAllUsers, getUserByEmail, getUserById, getUserByUsername, updateUser } from "../model/users.js"
import { checkPassword, hashPassword } from "../utils/hash_password.js"
import jwt from "jsonwebtoken"

export default function index(app) {

    /**
     * @openapi
     * /login:
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
     *       422:
     *         description: Missing Field
     *       500:
     *         description: Error
     * /register:
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
     *         description: Missing field
     *       500:
     *         description: Error
     * /users:
     *   get:
     *     tags:
     *       - users
     *     description: Get all users
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Error
     * /users/{user_id}:
     *   get:
     *     tags:
     *       - users
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
     *       500:
     *         description: Error
     *   delete:
     *     tags:
     *       - users
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
     *       500:
     *         description: Error
     */
    app.post('/register/', async (request, response) => {
        let body = request.body

        if (body.username === undefined || body.email === undefined || body.password === undefined)
            return response.status(422).json({error: "missing field"})
        try {
            let hashed_password = await hashPassword(body.password)
            await createUser(
                body.username,
                body.email,
                hashed_password,
            )
            return response.status(201).json({result: "User created successfully"})
        } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                return response.status(409).json({error: "Username or email is already taken"})
            }
        }
    })
    app.post('/login', async (request, response) => {
        let username = request.body.username
        let plainPassword = request.body.password

        try {
            let user = await getUserByUsername(username)
            if (user === null)
                user = await getUserByEmail(username)
            if (user === null || plainPassword === undefined)
                return response.status(422).json({error: "missing field"})
            let isValidPassword = await checkPassword(plainPassword, user.dataValues.password)
            if (isValidPassword === true) {
                const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.PRIVATE_KEY, {
                    expiresIn: '2h',
                });
                return response.status(200).json({jwt: token})    
            }
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.get('/users', async (request, response) => {
        try {
            let json = await getAllUsers()
            return response.status(200).json({result: json})
        } catch(error) {
            return response.status(500).json({error: error})
        }
    })
    app.get('/users/:user_id', async (request, response) => {
        let user_id = request.params.user_id

        try {
            let json = await getUserById(user_id)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.post('/users/', async (request, response) => {
        let body = request.body

        if (body.username === undefined || body.email === undefined || body.password === undefined)
            return response.status(422).json({error: "missing field"})
        try {
            let hashed_password = await hashPassword(body.password)
            await createUser(
                body.username,
                body.email,
                hashed_password,
                body.services
            )
            return response.status(201).json({result: "User created successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.put('/users/:user_id', async (request, response) => {
        let user_id = request.params.user_id
        let body = request.body

        if (body.password)
            body.password = await hashPassword(body.password)

        try {
            await updateUser(user_id, body)
            return response.status(200).json({result: "User changed successfully"})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.delete('/users/:user_id', async (request, response) => {
        let user_id = request.params.user_id

        try {
            await deleteUser(user_id)
            return response.status(200).json({result: "User deleted successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
}