/**
 * An array to store user objects.
 * @type {Array}
 */
export const users = [];

/**
 * Retrieves a user object by their unique identifier.
 *
 * @param {string} id - The unique identifier of the user.
 * @returns {Object|undefined} - The user object if found, or undefined if not found.
 */
export function getUserById(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].user && users[i].user.id === id)
            return users[i]
    }
    return undefined
}