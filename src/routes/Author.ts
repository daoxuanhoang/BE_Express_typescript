import express from 'express'
import controller from '../controllers/Author'
import { Schemas, ValidateJoi } from '../middlewares/Joi'

const router = express.Router()

router.post('/api/v1', ValidateJoi(Schemas.author.create), controller.createAuth)
router.get('/api/v1/:authId', controller.readAll)
router.get('/api/v1/auth', controller.readAll)
router.patch('/update/:authId', ValidateJoi(Schemas.author.update), controller.updateAuth)
router.delete('/api/v1/:authId', controller.deleteAuth)

export = router
