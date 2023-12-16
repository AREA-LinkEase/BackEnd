import bcrypt from 'bcrypt';

export async function hashPassword(password) {
    try {
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    } catch (error) {
        throw new Error('Error during hash of the password: ' + error.message)
    }
}

export async function checkPassword(inputPassword, hashedPassword) {
    try {
        const isPasswordMatch = await bcrypt.compare(inputPassword, hashedPassword);
        return isPasswordMatch;
    } catch (error) {
        throw new Error('Error invalid password: ' + error.message);
    }
}