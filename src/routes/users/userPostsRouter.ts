import express from 'express';
import {
  deletePostPermanently,
  editUserPost,
  getPostsByLoggedInUser,
  getPostsByUserName,
} from '@controller/users/usersPostController';
import authMiddleware from '@middlewares/authMiddleware';

const userPostsRouter = express.Router();

userPostsRouter.get('/user/:userName/posts', getPostsByUserName);
userPostsRouter.get(
  '/my-posts',
  authMiddleware,
  getPostsByLoggedInUser,
);
userPostsRouter.delete(
  '/user/post/:postId',
  authMiddleware,
  deletePostPermanently,
);

userPostsRouter.put(
  '/user/post/:postId',
  authMiddleware,
  editUserPost,
);

export default userPostsRouter;
