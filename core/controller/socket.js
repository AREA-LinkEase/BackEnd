export const users = [];

export function getUserById(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].user && users[i].user.id === id)
            return users[i]
    }
    return undefined
}