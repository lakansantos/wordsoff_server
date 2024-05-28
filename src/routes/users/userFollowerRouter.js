import express from 'express';
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
} from '../../controller/users/userFollowerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/user/:targetUserName/follow',
  authMiddleware,
  followUser,
);
router.get('/user/:targetUserName/followers', getUserFollowers);
router.get('/user/:targetUserName/following', getUserFollowing);
router.delete(
  '/user/:targetUserName/unfollow',
  authMiddleware,
  unfollowUser,
);

export default router;
