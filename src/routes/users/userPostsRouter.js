import express from 'express';
import {
  deletePostPermanently,
  editUserPost,
  getUserPost,
} from '../../controller/users/usersPostController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/:userName/posts', getUserPost);
router.delete(
  '/user/post/:postId',
  authMiddleware,
  deletePostPermanently,
);

router.put('/user/post/:postId', authMiddleware, editUserPost);

export default router;
