import express from 'express';
import {
  followUser,
  getUserFollowers,
} from '../../controller/users/userFollowerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/user/follower/:targetUserId',
  authMiddleware,
  followUser,
);
router.get('/user/followers/:targetUserId', getUserFollowers);

export default router;
