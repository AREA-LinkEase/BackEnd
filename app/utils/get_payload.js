import jwt from "jsonwebtoken"

/**
 * Retrieves the payload from a JWT token provided in the 'Bearer' authorization header.
 *
 * @param {string} bearer - The 'Bearer' token obtained from the authorization header.
 * @returns {object} - The decoded payload of the JWT token.
 * @throws {Error} - Throws an error if the token verification fails.
 */
export function getPayload(bearer) {
    const token = bearer.split(' ')[1]
    return jwt.verify(token, process.env.PRIVATE_KEY);
}