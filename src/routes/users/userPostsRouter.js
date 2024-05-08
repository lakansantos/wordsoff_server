import express from 'express';
import { getUserPost } from '../../controller/users/usersPostController.js';

const router = express.Router();

router.get('/user/:userId/posts', getUserPost);

export default router;
