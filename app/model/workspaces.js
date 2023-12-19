import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'

const Workspace = getSequelize().define('Workspace', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_private: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        users_id: {
            type: DataTypes.JSON,
            allowNull: true
        },
        variables: {
            type: DataTypes.JSON,
            allowNull: true
        },
        secrets: {
            type: DataTypes.JSON,
            allowNull: true
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: -1
        }
    }, {
        timestamps: false,
    }
)

export async function getWorkspaceView() {
    const workspaces = await Workspace.findAll({
        where: {
            is_private: false
        },
        attributes: ['title', 'description']
    })
    return workspaces
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
