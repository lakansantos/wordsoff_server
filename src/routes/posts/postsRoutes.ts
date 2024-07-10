import express from 'express';
import authMiddleware from '@middlewares/authMiddleware';
import {
  addPost,
  getPostById,
  getPosts,
} from '@controller/posts/postsController';

const postsRouter = express.Router();

postsRouter.post('/post', authMiddleware, addPost);
postsRouter.get('/posts', getPosts);
postsRouter.get('/post/:postId', getPostById);

export default postsRouter;
