import jwt from "jsonwebtoken"

export function getPayload(token) {
    const payload = jwt.verify(token, process.env.PRIVATE_KEY);
    return payload;
}