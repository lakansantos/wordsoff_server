declare namespace Express {
  interface Request {
    rateLimit: {
      resetTime: string;
    };
    token_id: string;
    file: {
      path: string;
    };
  }
}
