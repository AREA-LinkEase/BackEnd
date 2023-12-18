import {getServicesById} from "../model/services.js";
import {getUserById, updateUser} from "../model/users.js";

const REDIRECT_URI = "http://135.181.165.228:8080/services/callback"

export default function index(app) {
    app.get('/services/connect/:id_service', async (request, response) => {
        let id_service = request.params.id_service;
        let service = await getServicesById(id_service)

        if (!service) return response.status(404).json({error: "Service Not Found"})
        response.redirect(
            service.dataValues.auth_url + "?client_id=" +
            service.dataValues.client_id + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=code&scope=" + encodeURIComponent(service.dataValues.scope)  +
            "&state=" + id_service)
    })
    app.get('/services/callback', async (request, response) => {
        let user_id = 0;
        let code = request.query.code;
        let id_service = request.query.state;
        let service = await getServicesById(id_service)

        if (!service) return response.status(404).json({error: "Service Not Found"})
        if (code === undefined) return response.status(400).json({"error": 1})
        if (id_service === undefined) return response.status(400).json({"error": 1})
        const query = new URLSearchParams();
        query.append('client_id', service.dataValues.client_id);
        query.append('client_secret', service.dataValues.client_secret);
        query.append('grant_type', 'authorization_code');
        query.append('redirect_uri', REDIRECT_URI);
        query.append('scope', service.dataValues.scope);
        query.append('code', code);
        const data = await fetch(service.dataValues.token_url, { method: "POST", body: query }).then(response => response.json());
        let user = await getUserById(user_id)
        let services = user.dataValues.services
        services[service.dataValues.id] = data
        await updateUser(user_id, {
            services
        })
        response.status(200).json({result: "success"})
    })
}