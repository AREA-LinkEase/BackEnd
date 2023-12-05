import { Sequelize } from 'sequelize'

let sequelizeInstance = null

export async function connectDatabase() {
    if (!sequelizeInstance) {
        sequelizeInstance = new Sequelize('mysql://root:root@localhost:3306/linkease')
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
