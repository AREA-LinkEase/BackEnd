import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {Workspace} from "./workspaces.js";

const Automate = getSequelize().define('automates', {
    /**
     * @typedef {Object} AutomateAttributes
     * @property {number} id - Primary key, auto-incremented integer.
     * @property {string} title - Title of the automate, cannot be null.
     * @property {boolean} is_private - Indicates whether the automate is private or not.
     * @property {number} workspace_id - Foreign key referencing the Workspace model.
     * @property {Object} workflow - JSON representation of the automate's workflow.
     * @property {Object} variables - JSON representation of the automate's variables.
     * @property {boolean} is_enabled - Indicates whether the automate is enabled.
     * @property {bigint} views - Number of views for the automate.
     * @property {Array} logs - JSON representation of the automate's logs.
     */

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
    is_private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    workspace_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Workspace,
            key: 'id',
        },
    },
    workflow: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{}',
        get: function () {
            return JSON.parse(this.getDataValue('workflow'));
        },
        set: function (value) {
            this.setDataValue('workflow', JSON.stringify(value));
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
    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    views: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    logs: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get: function () {
            return JSON.parse(this.getDataValue('logs'));
        },
        set: function (value) {
            this.setDataValue('logs', JSON.stringify(value));
        }
    },
});

/**
 * Get all automates belonging to a specific workspace.
 *
 * @param {number} workspace_id - ID of the workspace.
 * @returns {Promise<Array<AutomateAttributes>>} - Promise resolving to an array of automates.
 */
export async function getAutomatesByWorkspace(workspace_id) {
    return await Automate.findAll({
        where: {
            workspace_id: workspace_id
        }
    })
}

/**
 * Get an automate by its ID.
 *
 * @param {number} id - ID of the automate.
 * @returns {Promise<AutomateAttributes|null>} - Promise resolving to the found automate or null if not found.
 */
export async function getAutomateById(id) {
    return await Automate.findOne({
        where: {
            id: id
        }
    })
}

/**
 * Create a new automate.
 *
 * @param {string} title - Title of the automate.
 * @param {boolean} is_private - Indicates whether the automate is private or not.
 * @param {number} workspace_id - ID of the workspace.
 * @returns {Promise<AutomateAttributes>} - Promise resolving to the created automate.
 */
export async function createAutomate(title, is_private, workspace_id) {
    return await Automate.create({
        title,
        is_private,
        workspace_id
    })
}

/**
 * Search for automates based on a partial match of their title.
 *
 * @param {string} input - Partial input to match against automate titles.
 * @returns {Promise<Array<AutomateAttributes>>} - Promise resolving to an array of matching automates.
 */
export async function searchAutomates(input) {
    return Automate.findAll({
        where: {
            title: {
                [Op.like]: `%${input}%`
            }
        }
    })
}

export { Automate }