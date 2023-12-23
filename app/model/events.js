import { DataTypes } from 'sequelize'
import { getSequelize } from '../getDataBaseConnection.js'
import {Services} from "./services.js";

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
    },
});

export { Events }