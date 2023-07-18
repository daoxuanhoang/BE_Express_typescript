import express from 'express'
import controller from '../controllers/Customer'
import { Schemas, ValidateJoi } from '../middlewares/Joi'
import { verifyToken } from '../middlewares/verifyToken'

const router = express.Router()

/**
*  @swagger
*   components:
*     securitySchemes:
*       AccessToken:      # arbitrary name for the security scheme
*         type: apiKey
*         in: header       # can be "header", "query" or "cookie"
*         name: Authorization  # name of the header, query parameter or cookie
*         description": Bearer token to access these api endpoints
*         scheme: bearer
*/

/**
 * @openapi
 * tags:
 *   - name: Customers
 *     description: Everything about your Customers
 *     externalDocs:
 *         description: Find out more
 *         url: http://swagger.io  
 * paths: 
 *   '/api/v1/customers':
 *       get:
 *         tags:
 *           - Customers
 *         security:
 *           - AccessToken: []
 *         summary: Lấy danh sách khách hàng
 *         description: Lấy danh sách khách hàng
 *         parameters:
 *           - name: page
 *             in: query
 *             example: 1
 *           - name: perPage
 *             in: query
 *             example: 10
 *           - name: search
 *             in: query
 *             description: name || email || phone
 *         responses:
 *           200:
 *             description: Success
 *           404:
 *             description: error
 */


router.get('/api/v1/customer', controller.readAll)
router.get('/api/v1/customers', verifyToken, controller.getCustomer)

export default router
