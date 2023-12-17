import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'
import {Automate} from "./automates.js";

const Services = getSequelize().define('Services', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        client_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        client_secret: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scope: {
            type: DataTypes.STRING,
            allowNull: false
        },
        auth_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
    }
)

export async function getServicesById(id) {
    const service = await Automate.findOne({
        where: {
            id: id
        }
    })
    return service
}

export { Services }