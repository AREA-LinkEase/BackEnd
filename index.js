import { app, root } from './config/express.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { users } from './core/controller/socket.js';
import { connectDatabase } from './app/getDataBaseConnection.js';
import { swaggerServe, swaggerSetup } from "./config/swagger.js";
import dotenv from 'dotenv';
import cors from "cors";


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

// Serving static assets from the 'public' directory under the '/assets' path
app.use('/assets', root.static('public'))

// Parsing URL-encoded and JSON request bodies
app.use(root.urlencoded({extended: true}))
app.use(root.json())

// Configuring Swagger documentation route
app.use('/docs', swaggerServe, swaggerSetup);

// Configuring CORS for specific origins
app.use(cors());


// Connecting to the database and performing further setup
connectDatabase().then(async () => {
    // Importing and executing the authentication middleware
    const { executeAuthMiddleware } = await import('./app/middleware/auth.js');
    executeAuthMiddleware(app)
    // Importing and executing the worker middleware
    const { executeWorkerMiddleware } = await import('./app/middleware/worker.js');
    executeWorkerMiddleware(app)
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
    let controller = await import('./core/controller/controller.js');
    controller.default(app, "default")
})

// Starting the Express app on the specified port (default: 8080)
app.listen((process.env.APP_PORT) ? process.env.APP_PORT : 8080)
// Starting the HTTP server for Socket.IO on the specified port (default: 8079)
//http.listen((process.env.SOCKET_PORT) ? process.env.SOCKET_PORT : 8079)