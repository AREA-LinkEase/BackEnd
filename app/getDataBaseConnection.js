import { Sequelize } from 'sequelize'

let sequelizeInstance = null;

export function getSequelize() {
    return sequelizeInstance;
}

async function feedDatabase() {

}

export async function connectDatabase(isTest = false) {
    if (!sequelizeInstance) {
        if (process.env.DIALECT === 'sqlite' || process.env.DIALECT === undefined) {
            sequelizeInstance = new Sequelize({
                dialect: 'sqlite',
                storage: ((isTest) ? './test.sqlite' : './app.sqlite'),
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
        await User.sync({alter: true})
        await Automate.sync({alter: true})
        await Workspace.sync({alter: true})
        try {
            await sequelizeInstance.authenticate()
            console.log('Connexion à la base de données SQL établie avec succès.')
        } catch (error) {
            console.error('Impossible de se connecter à la base de données MySQL :', error)
            throw new Error('Connexion à la base de données échouée')
        }
        if (isTest)
            await feedDatabase();
    }
    return sequelizeInstance
}
