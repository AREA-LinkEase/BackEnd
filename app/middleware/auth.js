import { getPayload } from "../utils/get_payload.js";

export async function verifyToken(request, response, next) {
    let token = request.headers.token

    if (!token) return response.status(403).json({"error": "Unauthorized"})

    try {
        const payload = getPayload(token)
        if (Date.now() >= payload.exp * 1000) {
            return false;
        }
    } catch (e) {
        return response.status(403).json({"error": "Unauthorized"})
    }
    next();
}

export function executeAuthMiddleware(app) {
    app.use('/users/', verifyToken)
    app.use('/workspaces/', verifyToken)
    app.use('/automates/', verifyToken)
}
