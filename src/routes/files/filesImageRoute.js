import express from 'express';

import multer from 'multer';
import { uploadFileImage } from '../../controller/file/fileImageController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/upload-image', upload.single('image'), uploadFileImage);

export default router;
