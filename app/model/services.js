import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'

const Service = getSequelize().define('Service', {
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

export { Service }