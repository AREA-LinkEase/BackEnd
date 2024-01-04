import {DataTypes, Op} from 'sequelize'
import {getSequelize} from '../getDataBaseConnection.js'
import {User} from "./users.js";

/**
 * @typedef {Object} ServiceAttributes
 * @property {number} id - Primary key, auto-incremented integer.
 * @property {string} name - Name of the service.
 * @property {string} client_id - Client ID for authentication.
 * @property {string} client_secret - Client secret for authentication.
 * @property {string} scope - Scope of the service.
 * @property {string} auth_url - Authentication URL.
 * @property {string} token_url - Token URL.
 * @property {number} owner_id - Foreign key referencing the User model.
 * @property {string[]} users_id - Array of user IDs associated with the service.
 * @property {boolean} is_private - Indicates if the service is private.
 */

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

/**
 * Retrieves a service by its ID.
 * @param {number} id - The ID of the service.
 * @returns {Promise<ServiceAttributes|null>} - The found service or null if not found.
 */
export async function getServicesById(id) {
    return await Services.findOne({
        where: {
            id: id
        }
    })
}

/**
 * Creates a new service.
 * @param {string} name - Name of the service.
 * @param {string} client_id - Client ID for authentication.
 * @param {string} client_secret - Client secret for authentication.
 * @param {string} scope - Scope of the service.
 * @param {string} auth_url - Authentication URL.
 * @param {string} token_url - Token URL.
 * @param {number} owner_id - The ID of the owner user.
 * @param {boolean} is_private - Indicates if the service is private.
 * @returns {Promise<Services>} - A promise that resolves when the service is created.
 */
export async function createService(name, client_id, client_secret, scope, auth_url, token_url, owner_id, is_private) {
    return await Services.create({
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

/**
 * Retrieves all services.
 * @returns {Promise<ServiceAttributes[]>} - An array of all services.
 */
export async function getAllServices() {
    return Services.findAll();
}

/**
 * Retrieves all public services.
 * @returns {Promise<ServiceAttributes[]>} - An array of public services.
 */
export async function getAllPublicServices() {
    return Services.findAll({
        where: {
            is_private: false
        }
    })
}

/**
 * Retrieves all services associated with a user by ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<Model[]>} - An array of services associated with the user.
 */
export async function getAllServicesById(id) {
    let services = await Services.findAll();
    return services.filter((service) => service.owner_id === id || service.users_id.includes(id))
}

/**
 * Retrieves a service by its name.
 * @param {string} name - The name of the service.
 * @returns {Promise<ServiceAttributes|null>} - The found service or null if not found.
 */
export async function getServiceByName(name) {
    return await Services.findOne({
        where: {
            name: name
        }
    })
}

/**
 * Searches for services by name.
 * @param {string} input - The search input.
 * @returns {Promise<ServiceAttributes[]>} - An array of services matching the search criteria.
 */
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