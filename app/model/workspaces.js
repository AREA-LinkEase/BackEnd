import {DataTypes} from 'sequelize'
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
        defaultValue: '[]',
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

export async function getWorkspaceView() {
    return await Workspace.findAll({
        where: {
            is_private: false
        },
        attributes: ['title', 'description']
    })
}


export async function getAllWorkspaces(user_id) {
    const result = []
    const workspaces = await Workspace.findAll()
    workspaces.forEach(workspace => {
        if (JSON.parse(workspace.users_id).ids.includes(user_id))
            result.push(workspace)
    });
    return result
}

export async function getWorkspaceById(id, user_id) {
    const workspace = await Workspace.findOne({
        where: {
            id: id
        }
    })
    if (workspace && JSON.parse(workspace.users_id).ids.includes(user_id))
        return workspace
    else if (workspace === null)
        return 404
    return 403
}

export async function getWorkspaceByPrivacy(bool, user_id) {
    const result = []
    const workspaces = await Workspace.findAll({
        where: {
            is_private: bool
        }
    })
    workspaces.forEach(workspace => {
        if (JSON.parse(workspace.users_id).ids.includes(user_id))
            result.push(workspace)
    });
    return result
}

export async function updateWorkspace(id, user_id, changes) {
    const workspace = await getWorkspaceById(id, user_id)
    if (workspace === 404 || workspace === 403)
        return workspace
    await workspace.update(changes)
    return false
}

export async function getWorkspaceVariables(id, user_id) {
    const workspace = await Workspace.findOne({
        where: {
            id: id
        },
        attributes: ['variables', 'users_id']
    })
    console.log(workspace);
    if (workspace && JSON.parse(workspace.users_id).ids.includes(user_id))
        return workspace
    else if (workspace === null)
        return 404
    return 403
}

export async function createWorkspace(title, description, is_private, users_id, owner_id, variables, secrets) {
    const newWorkspace = await Workspace.create({
        title: title,
        description: description,
        is_private: is_private,
        users_id: users_id,
        variables: variables,
        secrets: secrets,
        owner_id: owner_id
    });
    return newWorkspace
}

export async function deleteWorkspace(workspace_id, user_id) {
    const workspace = await getWorkspaceById(workspace_id, user_id)
    if (workspace === 404 || workspace === 403)
        return workspace
    if (workspace.owner_id !== user_id)
        return 403
    await workspace.destroy()
    return false
}

export { Workspace }
