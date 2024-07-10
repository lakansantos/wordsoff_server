import { JWT_SECRET_KEY } from '@configs/environment';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type DecodedToken = {
  token_id: string;
};
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;
  if (!!authorization && authorization.startsWith('Bearer')) {
    const token = authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET_KEY as string,
      ) as DecodedToken;

      req.token_id = decoded.token_id;

      next();
    } catch (error) {
      if (!token)
        return res.status(400).json({
          message: 'No Token Found. Please relogin.',
        });

      return res.status(401).json({
        message: {
          text: 'Unauthorized',
          error: error,
        },
      });
    }
  } else {
    return res.status(400).json({
      message: 'Invalid Token. Please try again.',
    });
  }
};

export default authMiddleware;
