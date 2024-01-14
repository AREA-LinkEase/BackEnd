import bcrypt from 'bcrypt';

/**
 * Hashes a given password using bcrypt.
 *
 * @param {string} password - The plain text password to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
export async function hashPassword(password) {
    try {
        const saltRounds = 10
        return bcrypt.hash(password, saltRounds)
    } catch (error) {
        throw new Error('Error during hash of the password: ' + error.message)
    }
}

/**
 * Compares a plain text password with a hashed password using bcrypt.
 *
 * @param {string} inputPassword - The plain text password to be checked.
 * @param {string} hashedPassword - The hashed password to be compared against.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the passwords match.
 * @throws {Error} - Throws an error if the comparison fails.
 */
export async function checkPassword(inputPassword, hashedPassword) {
    try {
        return bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        throw new Error('Error invalid password: ' + error.message);
    }
}