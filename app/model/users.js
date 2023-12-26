import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'

/**
 * Represents a User model in the database.
 *
 * @typedef {Object} User
 * @property {number} id - The unique identifier for the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {Array} services - Array of services associated with the user.
 * @property {Array} friends - Array of friends associated with the user.
 * @property {string} type - The type of the user, e.g., 'google', 'discord', 'microsoft', or 'default'.
 */

const User = getSequelize().define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
    },
    services: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get: function () {
            return JSON.parse(this.getDataValue('services'));
        },
        set: function (value) {
            this.setDataValue('services', JSON.stringify(value));
        }
    },
    friends: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get: function () {
            return JSON.parse(this.getDataValue('friends'));
        },
        set: function (value) {
            this.setDataValue('friends', JSON.stringify(value));
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'default',
        validate: {
            isIn: [['google', 'discord', 'microsoft', 'default']],
        },
        comment: 'google | discord | microsoft | default',
    },
});

/**
 * Retrieves all users from the database.
 *
 * @returns {Promise<User[]>} A promise that resolves to an array of users.
 */
export async function getAllUsers() {
    return await User.findAll()
}

/**
 * Retrieves a user by their ID.
 *
 * @param {number} id - The ID of the user.
 * @returns {Promise<User|null>} A promise that resolves to the user with the specified ID or null if not found.
 */
export async function getUserById(id) {
    return await User.findOne({
        where: {
            id: id
        },
    })
}

/**
 * Retrieves a user by their username.
 *
 * @param {string} username - The username of the user.
 * @returns {Promise<User|null>} A promise that resolves to the user with the specified username or null if not found.
 */
export async function getUserByUsername(username) {
    return await User.findOne({
        where: {
            username: username
        }
    })
}

/**
 * Retrieves a user by their email.
 *
 * @param {string} email - The email address of the user.
 * @returns {Promise<User|null>} A promise that resolves to the user with the specified email or null if not found.
 */
export async function getUserByEmail(email) {
    return await User.findOne({
        where: {
            email: email
        }
    })
}

/**
 * Creates a default user with the provided username, email, and password.
 *
 * @param {string} username - The username of the new user.
 * @param {string} email - The email address of the new user.
 * @param {string} password - The password of the new user.
 * @returns {Promise<User>} A promise that resolves to the newly created user.
 */
export async function createDefaultUser(username, email, password) {
    return await User.create({
        username: username,
        email: email,
        password: password,
    })
}

/**
 * Creates a user with the provided username, email, and type.
 *
 * @param {string} username - The username of the new user.
 * @param {string} email - The email address of the new user.
 * @param {string} type - The type of the new user.
 * @returns {Promise<User>} A promise that resolves to the newly created user.
 */
export async function createServiceUser(username, email, type) {
    return await User.create({
        username: username,
        email: email,
        type: type,
    })
}

/**
 * Updates a user with the specified ID using the provided changes.
 *
 * @param {number} id - The ID of the user to be updated.
 * @param {Object} changes - The changes to be applied to the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is not found, otherwise false.
 */
export async function updateUser(id, changes) {
    const user = await getUserById(id)
    if (user === null)
        return true
    await user.update(changes)
    return false
}

/**
 * Deletes a user with the specified ID.
 *
 * @param {number} user_id - The ID of the user to be deleted.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is not found, otherwise false.
 */
export async function deleteUser(user_id) {
    const user = await getUserById(user_id)
    if (user === null)
        return true
    await user.destroy()
    return false
}

/**
 * Searches for users based on the provided input.
 *
 * @param {string} input - The input to search for in email and username.
 * @returns {Promise<Model[]>} A promise that resolves to an array of users matching the search criteria.
 */
export async function searchUser(input) {
    let part1 = await User.findAll({
        where: {
            email: {
                [Op.like]: `%${input}%`
            }
        }
    })
    let part2 = await User.findAll({
        where: {
            username: {
                [Op.like]: `%${input}%`
            }
        }
    })
    return [...part1, ...part2]
}

export { User }
