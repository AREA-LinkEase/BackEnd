import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'
import {User} from "./users.js";

const Services = getSequelize().define('services', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_secret: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scope: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    auth_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token_url: {
        type: DataTypes.STRING,
        allowNull: false,
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
        get: function () {
            return JSON.parse(this.getDataValue('users_id'));
        },
        set: function (value) {
            this.setDataValue('users_id', JSON.stringify(value));
        }
    },
    is_private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

export async function getServicesById(id) {
    const service = await Services.findOne({
        where: {
            id: id
        }
    })
    return service
}

export async function getServiceByName(name) {
    const service = await Services.findOne({
        where: {
            name: name
        }
    })
    return service
}

export { Services }