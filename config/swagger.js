import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
        url: "http://localhost:5050",
      },
    ],
  },
  apis: ['./app/controller/*.js'], // Chemin vers les fichiers contenant les routes de votre API
};

const specs = swaggerJsdoc(options);

export const swaggerSetup = swaggerUi.setup(specs, { explorer: true });
export const swaggerServe = swaggerUi.serve;
