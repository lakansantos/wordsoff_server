import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'You exceeded 3 login attempts in 15 minutes limit!',
  handler: (req, res) => {
    res.status(429).json({
      message: 'You exceeded 3 login attempts in 15 minutes limit!',
      payload: `Try again after: ${req.rateLimit.resetTime}`,
    });
  },
  requestWasSuccessful: (req, res) => res.statusCode < 400,
  skipSuccessfulRequests: true,
});

export default limiter;
