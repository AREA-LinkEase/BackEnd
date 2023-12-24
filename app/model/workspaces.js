import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {User} from "./users.js";

const Workspace = getSequelize().define('workspaces', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    is_private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    users_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        comment: '{id: user_id, permission: 0 | 1 | 2 | 3}',
        get: function () {
            return JSON.parse(this.getDataValue('users_id'));
        },
        set: function (value) {
            this.setDataValue('users_id', JSON.stringify(value));
        }
    },
    variables: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{}',
        get: function () {
            return JSON.parse(this.getDataValue('variables'));
        },
        set: function (value) {
            this.setDataValue('variables', JSON.stringify(value));
        }
    },
    views: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

export async function getAllWorkspaces(user_id) {
    const result = await Workspace.findAll({
        where: {
            owner_id: user_id
        }
    })
    const workspaces = await Workspace.findAll()
    workspaces.forEach(workspace => {
        for (const user of workspace.users_id)
            if (user.id === user_id)
                result.push(workspace)
    });
    return result
}

export async function getWorkspaceById(id) {
    return await Workspace.findOne({
        where: {
            id: id
        }
    })
}

export async function createWorkspace(title, description, is_private, users_id, owner_id) {
    return await Workspace.create({
        title: title,
        description: description,
        is_private: is_private,
        users_id: users_id,
        owner_id: owner_id
    })
}

export async function searchWorkspaces(input) {
    return Workspace.findAll({
        where: {
            title: {
                [Op.like]: `%${input}%`
            }
        }
    })
}

export { Workspace }
