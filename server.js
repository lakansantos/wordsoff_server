import dotenv from 'dotenv';
import express from 'express';

async function server() {
  // Load environment variables from .env file
  dotenv.config();

  const app = express();

  const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000

  app.listen(port, () => {
    console.log(`Listening to Port: ${port}`);
  });
}

server();
