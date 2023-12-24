import { Sequelize } from 'sequelize'
import {hashPassword} from "./utils/hash_password.js";
import * as fs from 'fs'

let sequelizeInstance = null;

export function getSequelize() {
    return sequelizeInstance;
}

async function feedDatabase(User, Automate, Workspace, Events, Services) {
    // Create user
    await User.create({
        password: await hashPassword("user created with jest"),
        email: "user@test.com",
        username: "user_test"
    })
}

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
        await sequelizeInstance.sync()
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
