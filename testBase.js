import {app, root} from "./config/express.js";
import {connectDatabase} from "./app/getDataBaseConnection.js";
import index from './core/controller/controller.js'

app.set('view engine', 'ejs')
app.set('views', './app/view')
app.use('/Assets', root.static('Public'))
app.use(root.urlencoded({extended: true}))
app.use(root.json())

export async function setupTest() {
    await connectDatabase();
    index(app, "default")
}