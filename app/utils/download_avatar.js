import fetch from 'node-fetch'
import fs from 'fs'

async function downloadAvatar(url, username) {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error('Unable to fetch avatar.');
        const imageBuffer = await response.buffer()
        fs.writeFileSync(username + '.png', imageBuffer);
    } catch (error) {
        console.error('Error downloading the avatar:', error);
    }
}

export { downloadAvatar }