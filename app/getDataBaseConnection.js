import { Sequelize } from 'sequelize'

let sequelizeInstance = null;

export function getSequelize() {
    return sequelizeInstance;
}

export async function connectDatabase() {
    if (!sequelizeInstance) {
        sequelizeInstance = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
             {
               host: process.env.HOST,
               dialect: process.env.DIALECT
             }
        )
        await sequelizeInstance.sync({alter: true})
        try {
            await sequelizeInstance.authenticate()
            console.log('Connexion à la base de données MySQL établie avec succès.')
        } catch (error) {
            console.error('Impossible de se connecter à la base de données MySQL :', error)
            throw new Error('Connexion à la base de données échouée')
        }
    }
    return sequelizeInstance
}
