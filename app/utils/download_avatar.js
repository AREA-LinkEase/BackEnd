import * as fs from 'fs';
import * as path from "path";
import {finished} from "stream/promises";
import {Readable} from "stream";

async function downloadAvatar(url, id) {
    try {
        const imageResponse = await fetch(url);
        const destination = path.resolve(process.cwd() + `/public/avatars`, `${id}.png`)
        const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
        await finished(Readable.fromWeb(imageResponse.body).pipe(fileStream));
    } catch (error) {
        console.error('Error downloading the avatar:', error);
    }
}

export { downloadAvatar }