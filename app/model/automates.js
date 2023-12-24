import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {Workspace} from "./workspaces.js";

const Automate = getSequelize().define('automates', {
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

export async function getAutomatesByWorkspace(workspace_id) {
    return await Automate.findAll({
        where: {
            workspace_id: workspace_id
        }
    })
}

export async function getAutomateById(id) {
    return await Automate.findOne({
        where: {
            id: id
        }
    })
}

export async function createAutomate(title, is_private, workspace_id) {
    return await Automate.create({
        title,
        is_private,
        workspace_id
    })
}

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