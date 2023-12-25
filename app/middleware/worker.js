import { Forbidden, Unauthorized } from "../utils/request_error.js";

export async function verifyToken(request, response, next) {
    let bearer = request.headers.authorization

    if (!bearer) return Unauthorized(response)
    if (bearer !== process.env.WORKER_KEY)
        return Forbidden(response)
    next();
}

export function executeWorkerMiddleware(app) {
    app.use('/worker/', verifyToken)
}