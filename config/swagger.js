/**
 * @module SwaggerConfig
 * @description Configuration for Swagger documentation using swagger-jsdoc and swagger-ui-express.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger options for API documentation generation.
 * @typedef {Object} SwaggerOptions
 * @property {Object} definition - Swagger definition object.
 * @property {string} definition.openapi - OpenAPI version (3.0.0).
 * @property {Object} definition.info - Information about the API.
 * @property {string} definition.info.title - Title of the API.
 * @property {string} definition.info.version - API version.
 * @property {string} definition.info.description - Description of the API.
 * @property {Object[]} definition.servers - Array of server objects.
 * @property {string} definition.servers[].url - Base URL of the server.
 * @property {Object} definition.components - Components section of the Swagger definition.
 * @property {Object} definition.components.securitySchemes - Security schemes definition.
 * @property {Object} definition.components.securitySchemes.BearerAuth - Bearer authentication scheme.
 * @property {string} definition.components.securitySchemes.BearerAuth.type - Type of security scheme (http).
 * @property {string} definition.components.securitySchemes.BearerAuth.scheme - Authentication scheme (bearer).
 * @property {string} definition.components.securitySchemes.BearerAuth.bearerFormat - Bearer token format (JWT).
 * @property {string} apis - Glob pattern specifying the location of API controllers.
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LinkEase-API',
      version: '1.0.0',
      description: 'API de LinkEase',
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
      },
    }
  },
  apis: ['./app/controller/*.js'],
};

/**
 * Generate Swagger specification object based on the provided options.
 * @type {Object}
 */
const specs = swaggerJsdoc(options);

/**
 * Setup Swagger UI middleware with the generated Swagger specification.
 * @type {Function}
 */
export const swaggerSetup = swaggerUi.setup(specs, { explorer: true });

/**
 * Middleware to serve Swagger UI resources.
 * @type {Function}
 */
export const swaggerServe = swaggerUi.serve;
