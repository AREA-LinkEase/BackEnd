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
        }
    }, {
        timestamps: false,
    }
)

export async function getAllWorkspaces() {
    const workspaces = await Workspace.findAll()
    return workspaces
}

export async function getWorkspaceById(id) {
    console.log(typeof(id))
    const workspace = await Workspace.findOne({
        where: {
            id: id
        }
    })
    return workspace
}

export async function getWorkspaceByPrivacy(bool) {
    const workspaces = await Workspace.findAll({
        where: {
            is_private: bool
        }
    })
    return workspaces
}

export async function updateWorkspace(id, changes) {
    const workspace = await getWorkspaceById(id)
    await workspace.update(changes)
}

export async function getWorkspaceVariables(id) {
    const workspace = await Workspace.findOne({
        where: {
            id: id
        },
        attributes: ["variables"]
    })
    return workspace
}

export async function createWorkspace(title, description, is_private, users_id, variables, secrets) {
    const newWorkspace = await Workspace.create({
        title: title,
        description: description,
        is_private: is_private,
        users_id: users_id,
        variables: variables,
        secrets: secrets
    });
    return newWorkspace
}

export async function deleteWorkspace(workspace_id) {
    const workspace = await getWorkspaceById(workspace_id)
    await workspace.destroy()
}

export { Workspace }
