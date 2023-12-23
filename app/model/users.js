import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'

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

export async function getAllUsers() {
    return await User.findAll()
}

export async function getUserById(id) {
    return await User.findOne({
        where: {
            id: id
        },
    })
}

export async function getUserByUsername(username) {
    return await User.findOne({
        where: {
            username: username
        }
    })
}

export async function getUserByEmail(email) {
    return await User.findOne({
        where: {
            email: email
        }
    })
}

export async function createDefaultUser(username, email, password) {
    return await User.create({
        username: username,
        email: email,
        password: password,
    })
}

export async function createServiceUser(username, email, type) {
    return await User.create({
        username: username,
        email: email,
        type: type,
    })
}

export async function updateUser(id, changes) {
    const user = await getUserById(id)
    if (user === null)
        return true
    await user.update(changes)
    return false
}

export async function deleteUser(user_id) {
    const user = await getUserById(user_id)
    if (user === null)
        return true
    await user.destroy()
    return false
}

export async function searchUser(input) {
    return User.findAll({
        where: {
            email: {
                [Op.like]: `%${input}%`
            },
            username: {
                [Op.like]: `%${input}%`
            }
        }
    })
}

export { User }
