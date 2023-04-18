import express from 'express'
import { body } from 'express-validator'
import controller from '../controllers/Author'
import { Schemas, ValidateJoi } from '../middlewares/Joi'
import { validateRequest, NotFoundError, NotAuthorizedError, paginate, requireAuth } from '@v8dev/common'
import { verifyToken } from '../middlewares/verifyToken'

const router = express.Router()
const validation = [body('password').trim().notEmpty().withMessage('You must supply a password')]

router.post('/api/v1', ValidateJoi(Schemas.author.create), controller.createAuth)
// router.get('/api/v1/auth/:authId', controller.readAuth)
router.get('/api/v1/users', verifyToken, controller.getUser)
// router.patch('/update/:authId', ValidateJoi(Schemas.author.update), controller.updateAuth)
// router.delete('/api/v1/:authId', controller.deleteAuth)
router.post('/api/v1/login', validation, controller.login)

export default router
