import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import {
  addPost,
  getPostById,
  getPosts,
} from '../../controller/posts/postsController.js';

const router = express.Router();

router.post('/post', authMiddleware, addPost);
router.get('/posts', getPosts);
router.get('/post/:postId', getPostById);

export default router;
