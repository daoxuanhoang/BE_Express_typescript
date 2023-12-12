import express from 'express'
import { verifyToken } from '../middlewares/verifyToken'
import controller from '../controllers/Post'

const router = express.Router()

router.get('/api/v1/posts', verifyToken, controller.getPosts)
router.post('/api/v1/posts', verifyToken, controller.createPosts)
router.delete("/api/v1/posts/:id", controller.deletePosts);

export default router