import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import { uploadImage } from '../../utils/uploads.js';

import fs from 'fs';

const uploadFileImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: 'No file selected',
      });
    }
    let image_file;

    if (file.path) {
      const { secure_url, public_id } = await uploadImage(file.path, {
        folder: 'posts',
      });

      image_file = {
        public_id,
        path: secure_url,
      };
    }
    fs.unlinkSync(file.path);

    return res.status(201).json({
      data: image_file,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { uploadFileImage };
