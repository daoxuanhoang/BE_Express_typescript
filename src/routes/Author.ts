// routes/Author.ts
import express from 'express'
import { body } from 'express-validator'
import controller from '../controllers/Author'
import { Schemas, ValidateJoi } from '../middlewares/Joi'
import { validateRequest, NotFoundError, NotAuthorizedError, paginate, requireAuth } from '@v8dev/common'
import { verifyToken } from '../middlewares/verifyToken'

const router = express.Router()
const validation = [body('password').trim().notEmpty().withMessage('You must supply a password')]

router.post('/api/v1/users/create', ValidateJoi(Schemas.author.create), controller.createAuth)
// router.get('/api/v1/auth/:authId', controller.readAuth)

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
 *   - name: Auth
 *     description: Everything about your Auth
 *     externalDocs:
 *         description: Find out more
 *         url: http://swagger.io  
 * paths: 
 *   '/api/v1/login':
 *       post:
 *         tags:
 *           - Auth
 *         summary: Đăng nhập hệ thống
 *         description: Đăng nhập hệ thống
 *         requestBody:
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: daoxuanhoang.2016@gmail.com
 *                   password:
 *                     type: string
 *                     example: 123456
 *         responses:
 *           200:
 *            description: Success
 *           404:
 *            description: Invalid password
 *   '/api/v1/users':
 *       get:
 *         tags:
 *           - Auth
 *         security:
 *           - AccessToken: []
 *         summary: Lấy danh sách các users
 *         description: Lấy danh sách các users
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
router.post('/api/v1/login', validation, ValidateJoi(Schemas.author.login), controller.login)
router.get('/api/v1/users', verifyToken, controller.getUser)
router.put('/api/v1/update/:_id', verifyToken, controller.updateAuth)
// router.delete('/api/v1/:authId', controller.deleteAuth)


/**
*  @swagger
*   components:
*     schemas:
*       Users:
*         type: object
*         properties:
*           id:
*            type: integer
*            format: int64
*            example: 1
*           name:
*            type: string
*            format: string
*            example: hoang
*           email:
*            type: string
*            format: email
*            example: daoxuanhoang.2016@gmail.com
*           phone:
*            type: number
*            example: 0349792407
*           birthday:
*            type: string
*            format: datetime
*            example: 28/03/1999
*           gender:
*            type: string
*            format: string
*            example: male
*           status:
*            type: boolean
*            example: true
*           avatar:
*            type: string
*            format: url
*            example: https://i.imgur.com/RaHct7c.jpg
*/

export default router
