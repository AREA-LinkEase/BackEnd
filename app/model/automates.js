import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'

const Automate = getSequelize().define('Automate', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        workspace_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        workflow: {
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

Automate.beforeUpdate((automate) => {
    if (automate.changed('workspace_id')) {
        throw new Error('Workspace ID cannot be updated.');
    }
})

export async function getAllAutomates() {
    const automates = await Automate.findAll()
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

export async function getAutomatesByWorkpace(workspace_id) {
    const automates = await Automate.findAll({
        where: {
            workspace_id: workspace_id
        }
    })
    return automates
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
    await automate.update(changes)
}

export async function deleteAutomate(automate) {
    await automate.destroy()
}

export { Automate }
