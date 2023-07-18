import express from 'express'
import controller from '../controllers/File'
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
 *   - name: Files
 *     description: Everything about your Files
 *     externalDocs:
 *         description: Find out more
 *         url: http://swagger.io  
 * paths: 
 *   '/api/v1/files':
 *     get:
 *       tags:
 *        - Files
 *       security:
 *        - AccessToken: []
 *       summary: Lấy danh sách file đã import
 *       description: Lấy danh sách file đã import
 *       parameters:
 *        - name: page
 *          in: query
 *          example: 1
 *        - name: perPage
 *          in: query
 *          example: 10
 *        - name: search
 *          in: query
 *          description: name 
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: error
 *   '/api/v1/uploadFiles':
 *     post:
 *       tags:
 *        - Files
 *       security:
 *        - AccessToken: []
 *       summary: Import files vào DB
 *       description: Import files vào DB
 *       requestBody:
 *        content:
 *         multipart/form-data:
 *          schema:
 *           type: object
 *           properties:
 *            file: 
 *              type: string
 *              format: binary
 *              example: abc.xml 
 *          encoding: 
 *           file: 
 *            contentType: text/xml, application/xml        
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: error
 */
router.get('/api/v1/files', verifyToken, controller.getFiles)
router.post('/api/v1/uploadFiles', verifyToken, controller.uploadFiles)

export default router
