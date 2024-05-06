import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import {
  addPost,
  getPosts,
} from '../../controller/posts/postsController.js';

const router = express.Router();

router.post('/post', authMiddleware, addPost);
router.get('/posts', getPosts);

export default router;
