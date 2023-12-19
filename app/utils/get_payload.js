import jwt from "jsonwebtoken"

export function getPayload(bearer) {
    const token = bearer.split(' ')[1]
    const payload = jwt.verify(token, process.env.PRIVATE_KEY);
    return payload;
}