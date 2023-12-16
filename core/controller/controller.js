import * as fs from 'fs'

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

export default function index(app, type) {
    let path = "./app/controller/"

    checkController(path, app, type)
}