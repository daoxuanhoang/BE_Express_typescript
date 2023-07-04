import express from 'express'
import controller from '../controllers/File'
import { verifyToken } from '../middlewares/verifyToken'

const router = express.Router()

router.get('/api/v1/files', verifyToken, controller.getFiles)
router.post('/api/v1/uploadFiles', verifyToken, controller.uploadFiles)

export default router
