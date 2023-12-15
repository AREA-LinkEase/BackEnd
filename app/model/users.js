import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'

const User = getSequelize().define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        services: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        timestamps: false,
    }
)

export async function getAllUsers() {
    const users = await User.findAll()
    return users
}

export async function getUserById(id) {
    const user = await User.findOne({
        where: {
            id: id
        }
    })
    return user
}

export async function getUserByUsername(username) {
    const user = await User.findOne({
        where: {
            username: username
        }
    })
    return user
}

export async function getUserByEmail(email) {
    const user = await User.findOne({
        where: {
            email: email
        }
    })
    return user
}

export async function createUser(username, email, password, services) {
    const newUser = await User.create({
        username: username,
        email: email,
        password: password,
        services: services
    });
    return newUser
}

export async function deleteUser(user_id) {
    const user = await getUserById(user_id)
    await user.destroy()
} 

export { User }
