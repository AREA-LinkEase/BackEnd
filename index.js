import { app, root } from './config/express.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { users } from './core/controller/socket.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDatabase } from './app/getDataBaseConnection.js';
import { swaggerServe, swaggerSetup } from "./config/swagger.js";
import dotenv from 'dotenv';
import cors from "cors";

// Getting the directory name of the current module
export const DIR_NAME = dirname(fileURLToPath(import.meta.url));

// Loading environment variables from a .env file
dotenv.config()

// Creating an HTTP server
const http = createServer();

// Creating a Socket.IO server and configuring CORS
export const io = new Server(http, {
    cors: {
      origin: "http://localhost:8080"
    }
});

// Configuring the view engine and views directory
app.set('view engine', 'ejs')
app.set('views', './app/view')

// Serving static assets from the 'Public' directory under the '/Assets' path
app.use('/Assets', root.static('Public'))

// Parsing URL-encoded and JSON request bodies
app.use(root.urlencoded({extended: true}))
app.use(root.json())

// Configuring Swagger documentation route
app.use('/docs', swaggerServe, swaggerSetup);

// Configuring CORS for specific origins
app.use(cors({
    origin: ['http://localhost:8081', 'http://135.181.165.228:8081']
}));


// Connecting to the database and performing further setup
connectDatabase().then(() => {
    // Importing and executing the authentication middleware
    import('./app/middleware/auth.js').then(({ executeAuthMiddleware }) => {
        executeAuthMiddleware(app)
    });
    // Importing and executing the worker middleware
    import('./app/middleware/worker.js').then(({ executeWorkerMiddleware }) => {
        executeWorkerMiddleware(app)
    });
    // Handling socket connections
    io.on("connection", function (socket) {
        users.push(socket)
        import('./core/controller/controller.js').then((controller) => {
            controller.default(socket, "socket")
        })
        // Handling socket disconnections
        socket.on("disconnect", () => {
            let i = users.indexOf(socket);
            users.splice(i, 1);
        })
    });

    // Importing and executing the default app controller
    import('./core/controller/controller.js').then((controller) => {
        controller.default(app, "default")
    })
})

// Starting the Express app on the specified port (default: 8080)
app.listen((process.env.APP_PORT) ? process.env.APP_PORT : 8080)
// Starting the HTTP server for Socket.IO on the specified port (default: 8079)
http.listen((process.env.SOCKET_PORT) ? process.env.SOCKET_PORT : 8079)