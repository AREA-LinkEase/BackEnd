import { getUserById } from "../model/users.js"
import { getPayload } from "../utils/get_payload.js";
import { Forbidden, Unauthorized } from "../utils/request_error.js";

export async function verifyToken(request, response, next) {
    let bearer = request.headers.authorization

    if (!bearer) return Unauthorized(response)

    try {
        const payload = getPayload(bearer)
        const user = await getUserById(payload.id)
        if (Date.now() >= payload.exp * 1000) {
            return Forbidden(response)
        }
        response.locals.user = user
    } catch (e) {
        return Forbidden(response)
    }
    next();
}

export function executeAuthMiddleware(app) {
    app.use('/users/', verifyToken)
    app.use('/workspaces/', verifyToken)
    app.use('/automates/', verifyToken)
}
