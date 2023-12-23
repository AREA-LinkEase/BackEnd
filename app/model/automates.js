import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'
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
    },
    variables: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
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
    },
});

Automate.beforeUpdate((automate) => {
    if (automate.changed('workspace_id')) {
        throw new Error('Workspace ID cannot be updated.');
    }
})

export async function getAllAutomates() {
    const automates = await Automate.findAll()
    return automates
}

export async function getAutomatesByWorkpace(workspace_id) {
    const automates = await Automate.findAll({
        where: {
            workspace_id: workspace_id
        }
    })
    return automates
}

export async function getAutomateById(id) {
    const automate = await Automate.findOne({
        where: {
            id: id
        }
    })
    return automate
}

export async function createAutomate(title, workspace_id, workflow, variables, secrets) {
    const newAutomate = await Automate.create({
        title: title,
        workspace_id: workspace_id,
        workflow: workflow,
        variables: variables,
        secrets: secrets
    });
    return newAutomate
}

export async function updateAutomate(id, changes) {
    const automate = await getAutomateById(id)
    if (automate === null)
        return true
    await automate.update(changes)
    return false
}

export async function deleteAutomate(automate_id) {
    const automate = await getAutomateById(automate_id)
    if (automate === null)
        return true
    await automate.destroy()
    return false
}

export { Automate }