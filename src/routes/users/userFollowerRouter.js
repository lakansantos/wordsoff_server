import express from 'express';
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
} from '../../controller/users/userFollowerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/user/follower/:targetUserId',
  authMiddleware,
  followUser,
);
router.get('/user/followers/:targetUserId', getUserFollowers);
router.get('/user/following/:targetUserId', getUserFollowing);

export default router;
