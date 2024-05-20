import express from 'express';
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
} from '../../controller/users/userFollowerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/user/:targetUserId/follow', authMiddleware, followUser);
router.get('/user/:targetUserId/followers', getUserFollowers);
router.get('/user/:targetUserId/following', getUserFollowing);

export default router;
