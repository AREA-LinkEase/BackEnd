import {createService, getAllServicesById, getServicesById, searchServices} from "../model/services.js";
import {getUserById, updateUser} from "../model/users.js";
import { getPayload } from "../utils/get_payload.js";
import {BadRequest, Forbidden, InternalError, NotFound, UnprocessableEntity} from "../utils/request_error.js";
import {
  createEvent,
  getActionsByServiceId, getAllEvents,
  getEventById,
  getEventsByServiceId,
  getTriggersByServiceId, searchEvents
} from "../model/events.js";

/**
 * @swagger
 * tags:
 *   name: Service
 *   description: Service connection
 */

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Services management
 */

/**
 * @swagger
 * /service/connect/{id_service}/{authorization}:
 *   get:
 *     tags: [Service]
 *     summary: Redirects to the service's authentication page.
 *     description: |
 *       Redirects the user to the authentication page of the specified service.
 *     parameters:
 *       - in: path
 *         name: id_service
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: authorization
 *         required: true
 *         description: The Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirects to the service's authentication page.
 *       '401':
 *         description: Unauthorized. Invalid or missing Bearer token.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 */

/**
 * @swagger
 * /service/callback:
 *   get:
 *     tags: [Service]
 *     summary: Handles the callback after user authentication.
 *     description: |
 *       Handles the callback after the user completes authentication on the service's page.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: The authentication code received from the service.
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         description: The state parameter containing service and user IDs.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Authentication successful. Returns success status.
 *       '400':
 *         description: Bad Request. Missing code or state parameters.
 *       '401':
 *         description: Unauthorized. Invalid or missing Bearer token.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. Error during authentication.
 */

/**
 * @swagger
 * /services/search/{input}:
 *   get:
 *     tags: [Services]
 *     summary: Search for services based on input.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Searches for services based on the provided input.
 *     parameters:
 *       - in: path
 *         name: input
 *         required: true
 *         description: The search input.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Returns the list of services matching the search.
 *         content:
 *           application/json:
 *             example: [{"id": 1, "name": "Service1", "is_private": false}, {"id": 2, "name": "Service2", "is_private": true}]
 *       '500':
 *         description: Internal Server Error. An error occurred during the search.
 */

/**
 * @swagger
 * /services/@me/public:
 *   get:
 *     tags: [Services]
 *     summary: Get public services for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves public services associated with the authenticated user.
 *     responses:
 *       '200':
 *         description: OK. Returns the list of public services for the user.
 *         content:
 *           application/json:
 *             example: [{"id": 1, "name": "Service1", "is_private": false}, {"id": 2, "name": "Service2", "is_private": false}]
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/@me/private:
 *   get:
 *     tags: [Services]
 *     summary: Get private services for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves private services associated with the authenticated user.
 *     responses:
 *       '200':
 *         description: OK. Returns the list of private services for the user.
 *         content:
 *           application/json:
 *             example: [{"id": 3, "name": "PrivateService1", "is_private": true}, {"id": 4, "name": "PrivateService2", "is_private": true}]
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/@me:
 *   get:
 *     tags: [Services]
 *     summary: Get all services for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves all services associated with the authenticated user.
 *     responses:
 *       '200':
 *         description: OK. Returns the list of all services for the user.
 *         content:
 *           application/json:
 *             example: [{"id": 1, "name": "Service1", "is_private": false}, {"id": 2, "name": "Service2", "is_private": false}, {"id": 3, "name": "PrivateService1", "is_private": true}]
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/@me:
 *   post:
 *     tags: [Services]
 *     summary: Create a new service for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Creates a new service for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "NewService", "client_id": "client123", "client_secret": "secret123", "scope": "read write", "auth_url": "https://example.com/auth", "token_url": "https://example.com/token", "is_private": false}
 *     responses:
 *       '200':
 *         description: OK. Service has been created successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Service has been created successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request body.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/users/{user_id}:
 *   delete:
 *     tags: [Services]
 *     summary: Remove a user from a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Removes a user from the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to be removed.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Service has been deleted successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Service has been deleted successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request parameters.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/users:
 *   get:
 *     tags: [Services]
 *     summary: Get users associated with a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves the list of users associated with the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Returns the list of user IDs associated with the service.
 *         content:
 *           application/json:
 *             example: [123, 456, 789]
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/users:
 *   post:
 *     tags: [Services]
 *     summary: Add a user to a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Adds a user to the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"id": 123}
 *     responses:
 *       '200':
 *         description: OK. User has been added to the service successfully.
 *         content:
 *           application/json:
 *             example: {"result": "User has been added to the service successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request body.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/triggers:
 *   get:
 *     tags: [Services]
 *     summary: Get triggers associated with a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves the list of triggers associated with the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Returns the list of triggers associated with the service.
 *         content:
 *           application/json:
 *             example: [{"id": 1, "name": "Trigger1", "type": "trigger"}, {"id": 2, "name": "Trigger2", "type": "trigger"}]
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/actions:
 *   get:
 *     tags: [Services]
 *     summary: Get actions associated with a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves the list of actions associated with the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Returns the list of actions associated with the service.
 *         content:
 *           application/json:
 *             example: [{"id": 1, "name": "Action1", "type": "action"}, {"id": 2, "name": "Action2", "type": "action"}]
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/events:
 *   post:
 *     tags: [Services]
 *     summary: Create a new event for a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Creates a new event (trigger or action) for the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "NewEvent", "type": "trigger"}
 *     responses:
 *       '200':
 *         description: OK. Event has been created successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Event has been created successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request body.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/events/{event_id}:
 *   put:
 *     tags: [Services]
 *     summary: Update an existing event for a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Updates an existing event (trigger or action) for the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: event_id
 *         required: true
 *         description: The ID of the event.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "UpdatedEvent", "workflow": {"step1": "action1"}}
 *     responses:
 *       '200':
 *         description: OK. Event has been updated successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Event has been updated successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request body.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service or event with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}/events/{event_id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete an existing event for a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Deletes an existing event (trigger or action) for the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: event_id
 *         required: true
 *         description: The ID of the event.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Event has been deleted successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Event has been deleted successfully"}
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service or event with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Get details of a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Retrieves details of the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Returns details of the service.
 *         content:
 *           application/json:
 *             example: {"id": 1, "name": "Service1", "is_private": false, "client_id": "client123", "client_secret": "secret123", "scope": "read write", "auth_url": "https://example.com/auth", "token_url": "https://example.com/token"}
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update details of a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Updates details of the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: {"name": "UpdatedService", "client_id": "updated123", "client_secret": "updatedsecret123", "scope": "updated read write", "auth_url": "https://updatedexample.com/auth", "token_url": "https://updatedexample.com/token", "is_private": true}
 *     responses:
 *       '200':
 *         description: OK. Service has been updated successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Service has been updated successfully"}
 *       '422':
 *         description: Unprocessable Entity. Invalid request body.
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete a service.
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Deletes the specified service.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the service.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK. Service has been deleted successfully.
 *         content:
 *           application/json:
 *             example: {"result": "Service has been deleted successfully"}
 *       '403':
 *         description: Forbidden. Access to the service is not allowed.
 *       '404':
 *         description: Not Found. Service with the provided ID not found.
 *       '500':
 *         description: Internal Server Error. An error occurred during the operation.
 */

/**
 * @swagger
 * /services/events/search/{input}:
 *   get:
 *     summary: Search for events by input
 *     description: Retrieve events matching the provided input text.
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: input
 *         schema:
 *           type: string
 *         required: true
 *         description: The input text to search for events.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       '401':
 *         description: Unauthorized. Bearer token is missing or invalid.
 *       '403':
 *         description: Forbidden. The user does not have permission to access the events.
 */

/**
 * @swagger
 * /services/events/@all:
 *   get:
 *     summary: Get all events
 *     description: Retrieve all events.
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       '401':
 *         description: Unauthorized. Bearer token is missing or invalid.
 *       '403':
 *         description: Forbidden. The user does not have permission to access the events.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         service_id:
 *           type: integer
 *         workflow:
 *           type: object
 *         type:
 *           type: string
 *           enum: [action, trigger]
 *       required:
 *         - id
 *         - name
 *         - service_id
 *         - workflow
 *         - type
 */



export const REDIRECT_URI = "http://135.181.165.228:8080/service/callback"

export default function index(app) {
    app.get('/service/connect/:id_service/:authorization', async (request, response) => {
        let payload = getPayload("Bearer " + request.params.authorization);
        let id_service = request.params.id_service;
        try {
          id_service = parseInt(id_service);
        } catch (e) {
          return BadRequest(response)
        }
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
        try {
          id_service = parseInt(id_service)
          user_id = parseInt(user_id)
        } catch (e) {
          return BadRequest(response)
        }
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
        let services = user.services
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
            let events = await getEventsByServiceId(service_id);
            for (const event of events)
              await event.destroy()
            await service.destroy()
            return response.status(200).json({result: "Service has been deleted successfully"})
        } catch (error) {
            return InternalError(response)
        }
    })
    app.get('/services/events/search/:input', async (request, response) => {
      try {
        let input = request.params.input
        let events = await searchEvents(input)
        let results = [];
        let user_id = response.locals.user.id;

        for (const event of events) {
          let service = await getServicesById(event.service_id);

          if (service.is_private) {
            if (service.owner_id === user_id || service.users_id.includes(user_id)) {
              results.push(event.toJSON())
            }
          } else {
            results.push(event.toJSON())
          }
        }
        return response.status(200).json(results)
      } catch(error) {
        InternalError(response)
      }
    })
    app.get('/services/events/@all', async (request, response) => {
      try {
        let events = await getAllEvents()
        let results = [];
        let user_id = response.locals.user.id;

        for (const event of events) {
          let service = await getServicesById(event.service_id);

          if (service.is_private) {
            if (service.owner_id === user_id || service.users_id.includes(user_id)) {
              results.push(event.toJSON())
            }
          } else {
            results.push(event.toJSON())
          }
        }
        return response.status(200).json(results)
      } catch(error) {
        InternalError(response)
      }
    })
}