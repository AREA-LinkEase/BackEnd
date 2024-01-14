import { Forbidden, Unauthorized } from "../utils/request_error.js";

/**
 * Middleware function to verify the presence and validity of a token in the request headers.
 * @param {object} request - Express request object.
 * @param {object} response - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void} - Returns Unauthorized response or calls the next middleware.
 */
export async function verifyToken(request, response, next) {
    let bearer = request.headers.authorization

    if (!bearer) return Unauthorized(response)
    if (bearer !== process.env.WORKER_KEY)
        return Forbidden(response)
    next();
}

/**
 * Middleware function to execute the verifyToken middleware for routes starting with '/worker/'.
 * @param {object} app - Express application object.
 * @returns {void} - Attaches the verifyToken middleware to the '/worker/' route.
 */
export function executeWorkerMiddleware(app) {
    app.use('/worker/', verifyToken)
}