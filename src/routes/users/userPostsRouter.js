import express from 'express';
import {
  deletePostPermanently,
  getUserPost,
} from '../../controller/users/usersPostController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/:userId/posts', getUserPost);
router.delete(
  '/user/post/:postId',
  authMiddleware,
  deletePostPermanently,
);

export default router;
