import {getServicesById} from "../model/services.js";
import {getUserById, updateUser} from "../model/users.js";
import { BadRequest, NotFound } from "../utils/request_error.js";

const REDIRECT_URI = "http://135.181.165.228:8080/services/callback"

export default function index(app) {

    /**
     * @openapi
     * /services/connect/${id_service}:
     *   get:
     *     tags:
     *       - services
     *     description:
     *       Connect to a service by id
     *     parameters:
     *       - in: path
     *         name: service_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Service's ID to get
     *     responses:
     *       308:
     *         description: Redirect
     *       404:
     *         description: Service not found
     */

    app.get('/services/connect/:id_service', async (request, response) => {
        let id_service = request.params.id_service;
        let service = await getServicesById(id_service)

        if (!service) return NotFound(response)
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

        if (!service) return NotFound(response)
        if (code === undefined) return BadRequest(response)
        if (id_service === undefined) return BadRequest(response)
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