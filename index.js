import { app, root } from './config/express.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { users } from './core/controller/socket.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDatabase } from './app/getDataBaseConnection.js';
import { swaggerServe, swaggerSetup } from "./config/swagger.js";
import dotenv from 'dotenv';

export const DIR_NAME = dirname(fileURLToPath(import.meta.url));

dotenv.config()

const http = createServer();
export const io = new Server(http, {
    cors: {
      origin: "http://localhost:8080"
    }
});

app.set('view engine', 'ejs')
app.set('views', './app/view')
app.use('/Assets', root.static('Public'))
app.use(root.urlencoded({extended: true}))
app.use(root.json())
app.use('/docs', swaggerServe, swaggerSetup);


connectDatabase().then(() => {
    import('./app/middleware/auth.js').then(({ executeAuthMiddleware }) => {
        executeAuthMiddleware(app)
    });
    io.on("connection", function (socket) {
        users.push(socket)
        import('./core/controller/controller.js').then((controller) => {
            controller.default(socket, "socket")
        })
        socket.on("disconnect", () => {
            let i = users.indexOf(socket);
            users.splice(i, 1);
        })
    });

    import('./core/controller/controller.js').then((controller) => {
        controller.default(app, "default")
    })
})

app.listen((process.env.APP_PORT) ? process.env.APP_PORT : 8080)
http.listen((process.env.SOCKET_PORT) ? process.env.SOCKET_PORT : 8079)