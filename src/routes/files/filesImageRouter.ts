import express from 'express';

import multer from 'multer';
import { uploadFileImage } from '@controller/file/fileImageController';

const filesImageRouter = express.Router();

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

filesImageRouter.post(
  '/upload-image',
  upload.single('image'),
  uploadFileImage,
);

export default filesImageRouter;
