import { DataTypes } from 'sequelize'
import { connectDatabase } from '../getDataBaseConnection.js'

const sequelize = await connectDatabase()

const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        services: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        timestamps: false,
    }
);
  
export { User };

