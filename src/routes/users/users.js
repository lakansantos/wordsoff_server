import express from 'express';
import {
  getUsers,
  registerUser,
  viewUser,
} from '../../controller/users/usersController.js';

const router = express.Router();

router.get('/users', getUsers);
router.get('/user/:userId', viewUser);
router.post('/user', registerUser);

export default router;
