import express from 'express';
import {
  editUserDetails,
  getUsers,
  registerUser,
  uploadCoverPhotoImage,
  uploadProfileImage,
  viewUser,
} from '@controller/users/usersController';
import authMiddleware from '@middlewares/authMiddleware';

const usersRouter = express.Router();

usersRouter.get('/users', getUsers);
usersRouter.get('/user/:userName', viewUser);
usersRouter.post('/user/register', registerUser);
usersRouter.put('/user/edit', authMiddleware, editUserDetails);
usersRouter.post(
  '/user/profile-image',
  authMiddleware,
  uploadProfileImage,
);
usersRouter.post(
  '/user/cover-photo',
  authMiddleware,
  uploadCoverPhotoImage,
);

export default usersRouter;
