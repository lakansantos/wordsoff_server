import express from 'express';
import {
  followUser,
  getUserFollowers,
} from '../../controller/users/userFollowerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/user/follow/:targetUserId', authMiddleware, followUser);
router.get('/user/follow/:targetUserId', getUserFollowers);

export default router;
