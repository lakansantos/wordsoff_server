import { JWT_SECRET_KEY } from '../config/environment.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!!authorization && authorization.startsWith('Bearer')) {
    const token = authorization.split(' ')[1];

    try {
      jwt.verify(token, JWT_SECRET_KEY, (err, decodedToken) => {
        if (err) {
          return res.status(400).json({
            message: 'Invalid Token',
          });
        }

        const user_id = decodedToken.user_id;
        req.user_id = user_id;

        next();
      });
    } catch (error) {
      if (!token)
        return res.status(400).json({
          message: 'No Token Found. Please relogin.',
        });
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
  } else {
    return res.status(400).json({
      message: 'Invalid Token. Please try again.',
    });
  }
};

export default authMiddleware;
