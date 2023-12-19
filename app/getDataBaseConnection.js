import { Sequelize } from 'sequelize'
import {hashPassword} from "./utils/hash_password.js";

let sequelizeInstance = null;

export function getSequelize() {
    return sequelizeInstance;
}

async function feedDatabase(User, Automate, Workspace) {
    // Create User
    User.destroy({
        where: {},
        truncate: true
    })
    Automate.destroy({
        where: {},
        truncate: true
    })
    Workspace.destroy({
        where: {},
        truncate: true
    })
    User.create({
        password: await hashPassword("test"),
        email: "test@etest.com",
        username: "test"
    })
}

export async function connectDatabase(isTest = false) {
    if (!sequelizeInstance) {
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
        if (isTest) {
            await sequelizeInstance.sync({ force: true });
        } else {
            await sequelizeInstance.sync()
        }
        let { User } = await import("./model/users.js");
        let { Automate } = await import("./model/automates.js")
        let { Workspace } = await import("./model/workspaces.js")
        let { Services } = await import("./model/services.js")
        await User.sync()
        await Automate.sync()
        await Workspace.sync()
        await Services.sync()
        try {
            await sequelizeInstance.authenticate()
            console.log('Connexion à la base de données SQL établie avec succès.')
        } catch (error) {
            console.error('Impossible de se connecter à la base de données MySQL :', error)
            throw new Error('Connexion à la base de données échouée')
        }
        if (isTest)
            await feedDatabase(User, Automate, Workspace);
    }
    return sequelizeInstance
}
