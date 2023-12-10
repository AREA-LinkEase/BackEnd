import { DataTypes } from 'sequelize'
import { connectDatabase } from '../getDataBaseConnection.js'

const sequelize = await connectDatabase()

const Automate = sequelize.define('Automate', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        workspace_id: {
            type: DataTypes.JSON,
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
        }
    }, {
        timestamps: false,
    }
)

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

export async function deleteAutomate(automate) {
    await automate.destroy()
}

export { Automate }
