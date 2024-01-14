import { getUserById } from "../model/users.js"
import { getPayload } from "../utils/get_payload.js";
import { Forbidden, Unauthorized } from "../utils/request_error.js";

/**
 * Middleware to verify the authenticity of a token in the request header.
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 * @param {Function} next - Express next function to pass control to the next middleware.
 * @returns {void}
 */
export async function verifyToken(request, response, next) {
    let bearer = request.headers.authorization

    if (!bearer) return Unauthorized(response)

    try {
        const payload = getPayload(bearer)
        const user = await getUserById(payload.id)
        if (Date.now() >= payload.exp * 1000) {
            return Forbidden(response)
        }
        delete user.password
        response.locals.user = user
    } catch (e) {
        return Forbidden(response)
    }
    next();
}

/**
 * Middleware function to execute the verifyToken middleware for specific routes.
 * @param {Object} app - Express app object.
 * @returns {void}
 */
export function executeAuthMiddleware(app) {
    app.use('/users/', verifyToken)
    app.use('/workspaces/', verifyToken)
    app.use('/automates/', verifyToken)
    app.use('/services/', verifyToken)
}
