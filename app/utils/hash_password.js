import bcrypt from 'bcrypt';

export async function hashPassword(password) {
    try {
        const saltRounds = 10
        return bcrypt.hash(password, saltRounds)
    } catch (error) {
        throw new Error('Error during hash of the password: ' + error.message)
    }
}

export async function checkPassword(inputPassword, hashedPassword) {
    try {
        return bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        throw new Error('Error invalid password: ' + error.message);
    }
}