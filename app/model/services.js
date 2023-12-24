import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {User} from "./users.js";
import {Workspace} from "./workspaces.js";

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
    return await Services.findOne({
        where: {
            id: id
        }
    })
}

export async function createService(name, client_id, client_secret, scope, auth_url, token_url, owner_id, is_private) {
    await Services.create({
        name,
        client_id,
        client_secret,
        scope,
        auth_url,
        token_url,
        owner_id,
        is_private
    })
}

export async function getAllServices() {
    return Services.findAll();
}

export async function getAllPublicServices() {
    return Services.findAll({
        where: {
            is_private: false
        }
    })
}

export async function getAllServicesById(id) {
    let services = await Services.findAll();
    return services.filter((service) => service.owner_id === id || service.users_id.includes(id))
}

export async function getServiceByName(name) {
    return await Services.findOne({
        where: {
            name: name
        }
    })
}

export async function searchServices(input) {
    return Services.findAll({
        where: {
            name: {
                [Op.like]: `%${input}%`
            }
        }
    })
}

export { Services }