import express from 'express';
import {
  editUserDetails,
  getUsers,
  registerUser,
  uploadCoverPhotoImage,
  uploadProfileImage,
  viewUser,
} from '../../controller/users/usersController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/user/:userName', viewUser);
router.post('/user/register', registerUser);
router.put('/user/edit', authMiddleware, editUserDetails);
router.post(
  '/user/profile-image',
  authMiddleware,
  uploadProfileImage,
);
router.post(
  '/user/cover-photo',
  authMiddleware,
  uploadCoverPhotoImage,
);

export default router;
