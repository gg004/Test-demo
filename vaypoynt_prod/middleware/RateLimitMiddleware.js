const rateLimit = require("express-rate-limit");
module.exports = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 100, // Limit each IP to 5 requests per `window` (here, per hour)
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
