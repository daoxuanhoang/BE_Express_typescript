import express from 'express'
import controller from '../controllers/Customer'
import { Schemas, ValidateJoi } from '../middlewares/Joi'

const router = express.Router()

router.get('/api/v1/customer', controller.readAll)

export default router
