import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {User} from "./users.js";
import { getRandomColor } from '../utils/get_color.js';

/**
 * @typedef {Object} WorkspaceModel
 * @property {number} id - Unique identifier for the workspace.
 * @property {string} title - Title of the workspace.
 * @property {string} description - Description of the workspace.
 * @property {boolean} is_private - Indicates whether the workspace is private or not.
 * @property {number} owner_id - User ID of the owner of the workspace.
 * @property {string} users_id - JSON string representing an array of users and their permissions.
 * @property {string} variables - JSON string representing variables associated with the workspace.
 * @property {number} views - Number of views the workspace has.
 * @property {boolean} is_enabled - Indicates whether the workspace is enabled or not.
 */

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
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "#007BFF"
    }
});

/**
 * Gets all workspaces owned by a specific user.
 * @param {number} user_id - User ID to filter workspaces.
 * @returns {Promise<WorkspaceModel[]>} - A promise resolving to an array of workspaces.
 */
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

/**
 * Gets a workspace by its ID.
 * @param {number} id - ID of the workspace.
 * @returns {Promise<WorkspaceModel|null>} - A promise resolving to the found workspace or null if not found.
 */
export async function getWorkspaceById(id) {
    return await Workspace.findOne({
        where: {
            id: id
        }
    })
}

/**
 * Creates a new workspace.
 * @param {string} title - Title of the new workspace.
 * @param {string} description - Description of the new workspace.
 * @param {boolean} is_private - Indicates whether the new workspace is private or not.
 * @param {string} users_id - JSON string representing an array of users and their permissions.
 * @param {number} owner_id - User ID of the owner of the new workspace.
 * @returns {Promise<WorkspaceModel>} - A promise resolving to the created workspace.
 */
export async function createWorkspace(title, description, is_private, users_id, owner_id) {
    return await Workspace.create({
        title: title,
        description: description,
        is_private: is_private,
        users_id: users_id,
        owner_id: owner_id,
        color: getRandomColor()
    })
}

/**
 * Searches for workspaces with a given title.
 * @param {string} input - The search input to match against workspace titles.
 * @returns {Promise<WorkspaceModel[]>} - A promise resolving to an array of matching workspaces.
 */
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
