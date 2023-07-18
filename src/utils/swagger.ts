import { Express, Request, Response } from 'express'
import { verifyToken } from '../middlewares/verifyToken'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const SERVICE_NAME = process.env.SERVICE_NAME
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${SERVICE_NAME} API DOCS`.toUpperCase(),
      version: '1.0.0',
      termsOfService: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      description:
        'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
      license: {
        name: 'Licensed Under MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'JSONPlaceholder',
        url: 'https://jsonplaceholder.typicode.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    schemes: ['http', 'https'],
    components: {
      securitySchemas: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
  },
  apis: ['**/*.ts', './build/**/*.js'],

}

const swaggerSpec = swaggerJsdoc(options)


function swaggerDocs(app: Express) {
  // Swagger page
  // console.log(SERVICE_NAME, 'SERVICE_NAME')
  app.use(`/api/v1/${SERVICE_NAME}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // Docs in JSON format
  app.get(`/api/v1/${SERVICE_NAME}/docs.json`, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  // console.log(`Docs available at http://localhost:3001/docs`)
}

export default swaggerDocs
