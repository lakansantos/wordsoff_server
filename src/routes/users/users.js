import express from 'express';
import {
  getUsers,
  registerUser,
} from '../../controller/users/usersController.js';

const router = express.Router();

router.get('/users', getUsers);
router.post('/user', registerUser);

export default router;
