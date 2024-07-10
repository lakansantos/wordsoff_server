import express from 'express';

import authMiddleware from '@middlewares/authMiddleware';
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
} from '@controller/users/userFollowerController';

const userFollowerRouter = express.Router();

userFollowerRouter.post(
  '/user/:targetUserName/follow',
  authMiddleware,
  followUser,
);
userFollowerRouter.get(
  '/user/:targetUserName/followers',
  getUserFollowers,
);
userFollowerRouter.get(
  '/user/:targetUserName/following',
  getUserFollowing,
);
userFollowerRouter.delete(
  '/user/:targetUserName/unfollow',
  authMiddleware,
  unfollowUser,
);

export default userFollowerRouter;
