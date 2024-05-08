import dotenv from 'dotenv';
import express from 'express';

import db from './src/config/db.js';
import usersRouter from './src/routes/users/users.js';
import authRouter from './src/routes/auth/authRoutes.js';
import postRouter from './src/routes/posts/postsRoutes.js';
import userPostsRouter from './src/routes/users/userPostsRouter.js';
import { API_VERSION_URL } from './src/config/environment.js';

async function server() {
  dotenv.config();

  db();
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('yehey');
  });

  app.use(API_VERSION_URL, usersRouter);
  app.use(API_VERSION_URL, authRouter);
  app.use(API_VERSION_URL, postRouter);
  app.use(API_VERSION_URL, userPostsRouter);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening to Port: ${port}`);
  });
}

server();
