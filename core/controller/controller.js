import * as fs from 'fs'

/**
 * Recursively checks the given directory for controller files and executes a specified function on each controller.
 *
 * @param {string} path - The path of the directory to check.
 * @param {object} app - The application object to pass to the controller functions.
 * @param {string} type - The type of controller function to execute.
 * @returns {boolean} - Always returns false.
 */
function checkController(path, app, type) {
    fs.readdir(path, { withFileTypes: true, encoding:'utf8', flag:'r' }, (err, files) => {
        if (err) throw err
        for (let i = 0; i < files.length; i++) {
            if (files[i].isDirectory()) { checkController(path + '/' + files[i].name); continue; }
            let extension = files[i].name.split('.').pop();
 
            if (extension === 'js') {
                import("../." + path + '/' + files[i].name).then((controller) => {
                    if (controller[type])
                        controller[type](app)
                })
            }
        }
    })
    return false;
}

/**
 * Initializes controllers for the application based on the specified type.
 *
 * @param {object} app - The application object to pass to the controller functions.
 * @param {string} type - The type of controller function to execute.
 */
export default function index(app, type) {
    let path = "./app/controller/"

    checkController(path, app, type)
}