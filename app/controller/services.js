import {getServicesById} from "../model/services.js";
import {getUserById, updateUser} from "../model/users.js";
import { getPayload } from "../utils/get_payload.js";
import { BadRequest, NotFound } from "../utils/request_error.js";

export const REDIRECT_URI = "http://localhost:8080/services/callback"

export default function index(app) {

    /**
     * @openapi
     * /services/connect/${id_service}:
     *   get:
     *     tags:
     *       - services
     *     description:
     *       Connect to a service by id
     *     security:
     *       - bearerAuth: []
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

    app.get('/services/connect/:id_service/:authorization', async (request, response) => {
        let payload = getPayload("Bearer " + request.params.authorization);
        let id_service = request.params.id_service;
        let service = await getServicesById(id_service)

        if (!service) return NotFound(response)
        response.redirect(
            service.dataValues.auth_url + "?client_id=" +
            service.dataValues.client_id + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=code&scope=" + encodeURIComponent(service.dataValues.scope) +
            "&state=" + id_service + ',' + payload.id)
    })
    app.get('/services/callback', async (request, response) => {
        let code = request.query.code;
        let [id_service, user_id] = request.query.state.split(',');
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
        let services = JSON.parse(user.dataValues.services)
        services[service.dataValues.name] = data
        await updateUser(user_id, {
            services
        })
        response.status(200).json({result: "success"})
    })
}