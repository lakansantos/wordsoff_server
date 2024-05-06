import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import { addPost } from '../../controller/posts/postsController.js';

const router = express.Router();

router.post('/post', authMiddleware, addPost);

export default router;
