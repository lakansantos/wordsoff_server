This is a Social Media Server powered by [NodeJS](https://nodejs.org/) and [Express](https://expressjs.com/)

## Getting Started

First, please ensure that you have the .env with the following keys before running the script:

```
PORT=
MONGODB_CONNECT_URI=
JWT_SECRET=
API_VERSION=
API_CLOUDINARY_SECRET=
API_CLOUDINARY_KEY=
API_CLOUD_NAME=
````

This project uses [Cloudinary](https://cloudinary.com/), and [MongoDB](https://mongodb.com/)
Please visit their site documentation for api keys.


Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000/api/{api_version}/posts) with your browser or postman to see the result.


## Deploy on Render or Railway

The easiest way to deploy your Express app is to use the [Render Platform](render.com) and [Railway](https://railway.app/)

