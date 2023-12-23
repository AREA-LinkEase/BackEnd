import {app, root} from "./config/express.js";
import {connectDatabase} from "./app/getDataBaseConnection.js";
import index from './core/controller/controller.js'
import dotenv from "dotenv";

dotenv.config()

app.set('view engine', 'ejs')
app.set('views', './app/view')
app.use('/Assets', root.static('Public'))
app.use(root.urlencoded({extended: true}))
app.use(root.json())

export async function setupTest() {
    import('./app/middleware/auth.js').then(({ executeAuthMiddleware }) => {
        executeAuthMiddleware(app)
    });
    await connectDatabase(true);
    index(app, "default")
}
