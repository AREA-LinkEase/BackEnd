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
    const workspace = await Workspace.findOne({
        where: {
            id: id
        }
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

export async function deleteWorkspace(workspace) {
    await workspace.destroy()
}

export { Workspace }
