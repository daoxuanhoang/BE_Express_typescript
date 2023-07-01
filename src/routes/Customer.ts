import express from 'express'
import controller from '../controllers/Customer'
import { Schemas, ValidateJoi } from '../middlewares/Joi'
import { verifyToken } from '../middlewares/verifyToken'

const router = express.Router()

router.get('/api/v1/customer', controller.readAll)
router.get('/api/v1/customers', verifyToken, controller.getCustomer)

export default router
