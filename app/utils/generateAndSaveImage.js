import {openai} from "../../config/openAI.js";
import * as fs from 'fs'
import * as path from "path";
import {Readable} from 'stream'
import {finished} from 'stream/promises'

/**
 * Generates and saves an image based on a given prompt.
 *
 * This asynchronous function uses the OpenAI's DALL-E 2 model to generate an image based on the provided prompt.
 * It then saves the generated image to a specific directory with the given file name. The function attempts to
 * handle any errors that occur during the image generation or saving process.
 *
 * @param {string} prompt - The prompt used to generate the image. This prompt is appended to a fixed string
 *                          "A photograph of the guy : " to form the final prompt for image generation.
 * @param {string} fileName - The name of the file under which the generated image will be saved. This name
 *                            should not include the file extension.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the image is successfully generated and saved,
 *                               or `false` if an error occurs during the process.
 *
 * @example
 * // Example of using generateAndSaveImage
 * generateAndSaveImage('a funny cat', 'cat-image')
 *   .then(result => {
 *     if (result) {
 *       console.log('Image generated and saved successfully');
 *     } else {
 *       console.log('Failed to generate and save image');
 *     }
 *   });
 */
export async function generateAndSaveImage(prompt, fileName) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: "A photograph of the guy : " + prompt,
      n: 1,
      size: '256x256'
    });

    if (response.data && response.data.length > 0) {
      const imageResponse = await fetch(response.data[0].url);
      const destination = path.resolve(process.cwd() + `/public/avatars`, `${fileName}.png`)
      const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
      await finished(Readable.fromWeb(imageResponse.body).pipe(fileStream));
    }
    return true;
  } catch (error) {
    console.error('Error generating image:', error);
    return false;
  }
}