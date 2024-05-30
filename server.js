import dotenv from 'dotenv';
import express from 'express';

import db from './src/config/db.js';
import usersRouter from './src/routes/users/users.js';
import authRouter from './src/routes/auth/authRoutes.js';
import postRouter from './src/routes/posts/postsRoutes.js';
import userPostsRouter from './src/routes/users/userPostsRouter.js';
import userFollowerRouter from './src/routes/users/userFollowerRouter.js';
import fileImageRouter from './src/routes/files/filesImageRoute.js';
import { API_VERSION_URL } from './src/config/environment.js';
import cors from 'cors';

import { Server } from 'socket.io';
import http from 'http';
async function server() {
  dotenv.config();

  db();
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(socket.id);
  });
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
  app.use(API_VERSION_URL, postRouter);
  app.use(API_VERSION_URL, userPostsRouter);
  app.use(API_VERSION_URL, userFollowerRouter);
  app.use(API_VERSION_URL, fileImageRouter);
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Listening to Port: ${port}`);
  });
}

server();
