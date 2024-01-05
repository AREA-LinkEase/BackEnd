import {DataTypes, Op} from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'
import {Services} from "./services.js";


/**
 * Represents the 'events' table in the database.
 *
 * @typedef {Object} Event
 * @property {number} id - The unique identifier for the event (auto-incremented integer).
 * @property {string} name - The name of the event (string).
 * @property {string} description - The name of the event (string).
 * @property {number} service_id - The foreign key referencing the 'id' in the 'Services' table.
 * @property {string} workflow - JSON-formatted text representing the workflow associated with the event.
 * @property {string} type - The type of the event ('action' or 'trigger').
 */

/**
 * Sequelize model representing the 'events' table.
 * @type {import('sequelize').Model<Event, Event>}
 */
const Events = getSequelize().define('events', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Services,
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
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['action', 'trigger']],
        },
        comment: 'action | trigger',
    }
});

/**
 * Retrieves all triggers associated with a given service ID.
 *
 * @param {number} id - The ID of the service.
 * @returns {Promise<Event[]>} - A promise that resolves to an array of trigger events.
 */
export async function getTriggersByServiceId(id) {
    return Events.findAll({
        where: {
            service_id: id,
            type: "trigger"
        }
    })
}

/**
 * Retrieves all actions associated with a given service ID.
 *
 * @param {number} id - The ID of the service.
 * @returns {Promise<Event[]>} - A promise that resolves to an array of action events.
 */
export async function getActionsByServiceId(id) {
    return Events.findAll({
        where: {
            service_id: id,
            type: "action"
        }
    })
}

/**
 * Retrieves all events associated with a given service ID.
 *
 * @param {number} id - The ID of the service.
 * @returns {Promise<Event[]>} - A promise that resolves to an array of events.
 */
export async function getEventsByServiceId(id) {
    return Events.findAll({
        where: {
            service_id: id
        }
    })
}

/**
 * Retrieves all events.
 *
 * @returns {Promise<Event[]>} - A promise that resolves to an array of events.
 */
export async function getAllEvents() {
    return Events.findAll()
}

/**
 * Retrieves an event by its ID.
 *
 * @param {number} id - The ID of the event.
 * @returns {Promise<Event|null>} - A promise that resolves to the found event or null if not found.
 */
export async function getEventById(id) {
    return Events.findOne({
        where: {
            id: id
        }
    })
}

/**
 * Creates a new event in the database.
 *
 * @param {string} name - The name of the event.
 * @param {string} description - The name of the event.
 * @param {string} type - The type of the event ('action' or 'trigger').
 * @param {string} description - The description of the event.
 * @param {number} service_id - The ID of the associated service.
 */
export async function createEvent(name, description, type, service_id) {
    await Events.create({
        name,
        description,
        type,
        service_id
    })
}

/**
 * Searches for events with a given name.
 * @param {string} input - The search input to match against events name.
 * @returns {Promise<Event[]>} - A promise resolving to an array of matching events.
 */
export async function searchEvents(input) {
    return Events.findAll({
        where: {
            name: {
                [Op.like]: `%${input}%`
            }
        }
    })
}

export { Events }