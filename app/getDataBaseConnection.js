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
 * @param {Model} User - The User model.
 * @param {Model} Automate - The Automate model.
 * @param {Model} Workspace - The Workspace model.
 */
async function feedDatabase(User, Automate, Workspace) {
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
        is_private: false,
        workspace_id: 1,
        logs: ["test"]
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
        if (process.env.DIALECT === 'sqlite' || process.env.DIALECT === undefined) {
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
        try {
            await sequelizeInstance.sync()
        } catch (e) {
            console.log(e)
            await sequelizeInstance.sync({force: true})
        }
        let { User } = await import("./model/users.js");
        let { Automate } = await import("./model/automates.js")
        let { Workspace } = await import("./model/workspaces.js")
        let { Services } = await import("./model/services.js")
        let { Events } = await import("./model/events.js")
        await User.sync()
        await Automate.sync()
        await Workspace.sync()
        await Services.sync()
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
