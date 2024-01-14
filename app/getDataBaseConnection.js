import { Sequelize } from 'sequelize'
import {hashPassword} from "./utils/hash_password.js";
import * as fs from 'fs'

let sequelizeInstance = null;

/**
 * Get the singleton instance of the Sequelize connection.
 * @returns {Sequelize | null} The Sequelize instance or null if not connected.
 */
export function getSequelize() {
    return sequelizeInstance;
}

/**
 * Feed the database with initial data for testing purposes.
 * @param {User} User - The User model.
 * @param {Automate} Automate - The Automate model.
 * @param {Workspace} Workspace - The Workspace model.
 * @param {Events} Events - The Events model.
 * @param {Services} Services - The Events model.
 */
async function feedDatabase(User, Automate, Workspace,  Events, Services) {
    // Create user
    await User.create({
        password: await hashPassword("user created with jest"),
        email: "user@test.com",
        username: "user_test"
    })
    // Create workspace
    await Workspace.create({
        title: "base title",
        description: "a description",
        is_private: false,
        users_id: [],
        owner_id: 1
    })
    // Create automate
    await Automate.create({
        title: "An automate",
        description: "a description",
        is_private: false,
        workspace_id: 1,
        logs: ["test"]
    })
    // Create service
    await Services.create({
        name: "aaaaaa",
        description: "aaaaaa",
        client_id: "aaaaaa",
        client_secret: "aaaaaaa",
        scope: "aaaaaaaaa",
        auth_url: "aaaaaaa",
        token_url: "aaaaaaa",
        owner_id: 1,
        users_id: []
    })
    // Create event
    await Events.create({
        name: "aaaaaa",
        description: "description",
        service_id: 1,
        type: "action"
    })
}

/**
 * Connect to the database using Sequelize.
 * @param {boolean} isTest - Indicates whether the connection is for testing purposes.
 * @returns {Promise<Sequelize>} The Sequelize instance.
 * @throws Will throw an error if the connection fails.
 */
export async function connectDatabase(isTest = false) {
    if (!sequelizeInstance) {
        if (isTest) {
            try {
                fs.rmSync("./test.sqlite", {force: true})
            } catch (e) {
                console.log(e)
            }
        }
        if (isTest || process.env.DIALECT === 'sqlite' || process.env.DIALECT === undefined) {
            sequelizeInstance = new Sequelize({
                dialect: 'sqlite',
                storage: ((isTest) ? './test.sqlite' : './app.sqlite'),
                logging: false
            })
        } else {
            sequelizeInstance = new Sequelize(
                process.env.DB_NAME,
                process.env.DB_USER,
                process.env.DB_PASSWORD,
                {
                    host: process.env.HOST,
                    dialect: process.env.DIALECT
                }
            )
        }
        await sequelizeInstance.sync()
        let { User } = await import("./model/users.js");
        await User.sync()
        let { Workspace } = await import("./model/workspaces.js")
        await Workspace.sync()
        let { Automate } = await import("./model/automates.js")
        await Automate.sync()
        let { Services } = await import("./model/services.js")
        await Services.sync()
        let { Events } = await import("./model/events.js")
        await Events.sync()
        try {
            await sequelizeInstance.authenticate()
            console.log('Connexion à la base de données SQL établie avec succès.')
        } catch (error) {
            console.error('Impossible de se connecter à la base de données MySQL :', error)
            throw new Error('Connexion à la base de données échouée')
        }
        if (isTest)
            await feedDatabase(User, Automate, Workspace, Events, Services);
    }
    return sequelizeInstance
}
