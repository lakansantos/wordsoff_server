import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import db from '@configs/db';
import { API_VERSION_URL } from '@configs/environment';
import authRouter from '@routes/auth/authRoutes';
import postsRouter from '@routes/posts/postsRoutes';
import userFollowerRouter from '@routes/users/userFollowerRouter';
import usersRouter from '@routes/users/users';
import userPostsRouter from '@routes/users/userPostsRouter';
import filesImageRouter from '@routes/files/filesImageRouter';
import emailSendRouter from '@routes/email/emailSendRouter';

async function server() {
  dotenv.config();
  db();
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/', (req, res) => {
    res.send('yehey');
  });

  app.use(
    cors({
      origin: '*',
    }),
  );
  app.use(API_VERSION_URL, usersRouter);
  app.use(API_VERSION_URL, authRouter);
  app.use(API_VERSION_URL, postsRouter);
  app.use(API_VERSION_URL, userPostsRouter);
  app.use(API_VERSION_URL, userFollowerRouter);
  app.use(API_VERSION_URL, filesImageRouter);
  app.use(API_VERSION_URL, emailSendRouter);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening to Port: ${port}`);
  });
}

server();
