import {app, root} from "./config/express.js";
import {connectDatabase} from "./app/getDataBaseConnection.js";
import index from './core/controller/controller.js'
import dotenv from "dotenv";

// Import the dotenv library to load environment variables from a .env file
dotenv.config()

// Set the view engine for the app to EJS (Embedded JavaScript)
app.set('view engine', 'ejs')
// Set the directory where views are located
app.set('views', './app/view')
// Serve static files from the 'Public' directory under the '/Assets' path
app.use('/Assets', root.static('Public'))
// Parse incoming requests with urlencoded payloads
app.use(root.urlencoded({extended: true}))
// Parse incoming requests with JSON payloads
app.use(root.json())

/**
 * Asynchronously sets up the test environment by executing various middleware
 * and connecting to the database before invoking the 'index' function.
 * @returns {Promise<void>} A Promise that resolves when the setup is complete.
 */
export async function setupTest() {
    // Import and execute the 'auth' middleware
    import('./app/middleware/auth.js').then(({ executeAuthMiddleware }) => {
        executeAuthMiddleware(app)
    });
    // Import and execute the 'worker' middleware
    import('./app/middleware/worker.js').then(({ executeWorkerMiddleware }) => {
        executeWorkerMiddleware(app)
    });
    // Connect to the database with the option to test initialization
    await connectDatabase(true);
    index(app, "default")
}
