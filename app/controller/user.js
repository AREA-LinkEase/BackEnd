import { hash } from "bcrypt"
import { createUser, deleteUser, getAllUsers, getUserByEmail, getUserById, getUserByUsername, User } from "../model/users.js"
import { checkPassword, hashPassword } from "../utils/hash_password.js"

export default function index(app) {
    app.post('/login', async (request, response) => {
        let username = request.body.username
        let plainPassword = request.body.password

        try {
            let user = await getUserByUsername(username)
            if (user === undefined)
                user = await getUserByEmail(username)
            if (user === undefined || plainPassword === undefined)
                return response.status(422).json({error: "missing field"})
            let isValidPassword = await checkPassword(plainPassword, user.dataValues.password)
            if (isValidPassword === true)
                return response.status(200).json({user: user})
        } catch (error) {
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
    app.get('/user/:user_id', async (request, response) => {
        let user_id = request.params.user_id

        try {
            let json = await getUserById(user_id)
            return response.status(200).json({result: json})
        } catch(error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
    app.post('/user/', async (request, response) => {
        let body = request.body

        if (body.username === undefined || body.email === undefined || body.password === undefined)
            return response.status(422).json({error: "missing field"})
        try {
            let hashed_password = await hashPassword(body.password)
            let json = await createUser(
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
    app.delete('/user/:user_id', async (request, response) => {
        let user_id = request.params.user_id

        try {
            let json = await deleteUser(user_id)
            return response.status(200).json({result: "User deleted successfully"})
        } catch (error) {
            console.log(error);
            return response.status(500).json({error: error})
        }
    })
}