import {createService, getAllServicesById, getServicesById, searchServices} from "../model/services.js";
import {getUserById, updateUser} from "../model/users.js";
import { getPayload } from "../utils/get_payload.js";
import {BadRequest, Forbidden, InternalError, NotFound, UnprocessableEntity} from "../utils/request_error.js";
import {createEvent, getActionsByServiceId, getEventById, getTriggersByServiceId} from "../model/events.js";

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

export const REDIRECT_URI = "http://135.181.165.228:8080/service/callback"

export default function index(app) {
    app.get('/service/connect/:id_service/:authorization', async (request, response) => {
        let payload = getPayload("Bearer " + request.params.authorization);
        let id_service = request.params.id_service;
        let service = await getServicesById(id_service)

        if (!service) return NotFound(response)
        if (service.is_private && service.owner_id !== payload.id && !service.users_id.includes(payload.id))
            return Forbidden(response)
        response.redirect(
            service.dataValues.auth_url + "?client_id=" +
            service.dataValues.client_id + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=code&scope=" + encodeURIComponent(service.dataValues.scope) +
            "&state=" + id_service + ',' + payload.id)
    })
    app.get('/service/callback', async (request, response) => {
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
    app.get('/services/search/:input', async (request, response) => {
        try {
            let input = request.params.input;
            let services = await searchServices(input);
            return response.status(200).json(services)
        } catch (error) {
            console.log(error)
            return InternalError(response)
        }
    })
    app.get('/services/@me/public', async (request, response) => {
        try {
            let services = await getAllServicesById(response.locals.user.id);
            let results = [];

            for (const service of services) {
                if (service.is_private) continue;
                results.push(service.toJSON());
            }
            return response.status(200).json(results)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/@me/private', async (request, response) => {
        try {
            let services = await getAllServicesById(response.locals.user.id);
            let results = [];

            for (const service of services) {
                if (!service.is_private) continue;
                results.push(service.toJSON());
            }
            return response.status(200).json(results)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/@me', async (request, response) => {
        try {
            let services = await getAllServicesById(response.locals.user.id);
            return response.status(200).json(services)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.post('/services/@me', async (request, response) => {
        try {
            let body = request.body;
            let user_id = response.locals.user.id;
            if (!['name', 'client_id', 'client_secret', 'scope', 'auth_url', 'token_url', 'is_private']
                .every((property) => body[property] !== undefined))
                return UnprocessableEntity(response)
            if (!['name', 'client_id', 'client_secret', 'scope', 'auth_url', 'token_url']
                .every((property) => typeof body[property] === "string"))
                return UnprocessableEntity(response)
            if (typeof body["is_private"] !== "boolean")
                return UnprocessableEntity(response)
            await createService(
                body["name"],
                body["client_id"],
                body["client_secret"],
                body["scope"],
                body["auth_url"],
                body["token_url"],
                user_id,
                body["is_private"]
            )
            return response.status(200).json({result: "Service has been created successfully"});
        } catch (error) {
            return InternalError(response)
        }
    })
    app.delete('/services/:id/users/:user_id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            let be_deleted_id = parseInt(request.params.user_id);
            if (isNaN(be_deleted_id))
                return UnprocessableEntity(response);
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let users_id = service.users_id.filter((user_id) => user_id !== be_deleted_id);
            service.update({users_id})
            return response.status(200).json({result: "Service has been deleted successfully"})
        } catch (error) {
            console.log(error)
            return InternalError(response)
        }
    })
    app.get('/services/:id/users', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let result = service.toJSON()
            return response.status(200).json(result.users_id)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.post('/services/:id/users', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let id = parseInt(request.body.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (isNaN(id))
                return UnprocessableEntity(response);
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let users_id = service.users_id;
            if (!users_id.includes(id))
                users_id.push(id)
            service.update({users_id})
            return response.status(200).json({result: "Service has been deleted successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/:id/triggers', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let triggers = await getTriggersByServiceId(service_id)
            return response.status(200).json(triggers)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/:id/actions', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let actions = await getActionsByServiceId(service_id)
            return response.status(200).json(actions)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.post('/services/:id/events', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            let body = request.body;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (!("name" in body) || !("type" in body) || typeof body["name"] !== "string")
                return UnprocessableEntity(response)
            if (body["type"] !== "trigger" && body["type"] !== "action")
                return UnprocessableEntity(response)
            await createEvent(body["name"], body["type"], service_id)
            return response.status(200).json({result: "Event has been created successfully"})
        } catch (error) {
            console.log(error)
            return InternalError(response)
        }
    })
    app.put('/services/:id/events/:event_id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let event_id = parseInt(request.params.event_id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            let body = request.body;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (!Object.keys(body).every((value) => ["name", "workflow"].includes(value)))
                return UnprocessableEntity(response)
            let event = await getEventById(event_id)
            if (event === null)
                return NotFound(response)
            await event.update(body)
            return response.status(200).json({result: "Event has been created successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.delete('/services/:id/events/:event_id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let event_id = parseInt(request.params.event_id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let event = await getEventById(event_id)
            if (event === null)
                return NotFound(response)
            await event.destroy()
            return response.status(200).json({result: "Event has been created successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/:id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            let result = service.toJSON()
            if (service.owner_id !== user_id && !service.users_id.includes(user_id)) {
                delete result["client_id"];
                delete result["client_secret"];
            }
            return response.status(200).json(result)
        } catch (error) {
            return InternalError(response)
        }
    })
    app.put('/services/:id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let body = request.body;
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (!Object.keys(body).every((value) =>
                ["name", "client_id", "client_secret", "scope", "auth_url", "token_url", "is_private"].includes(value)))
                return UnprocessableEntity(response)
            await service.update(body)
            return response.status(200).json({result: "Service has been updated successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.delete('/services/:id', async (request, response) => {
        try {
            let service_id = parseInt(request.params.id);
            let service = await getServicesById(service_id);
            let user_id = response.locals.user.id;
            if (service === null)
                return NotFound(response)
            if (service.is_private && service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            if (service.owner_id !== user_id && !service.users_id.includes(user_id))
                return Forbidden(response)
            await service.destroy()
            return response.status(200).json({result: "Service has been deleted successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
}