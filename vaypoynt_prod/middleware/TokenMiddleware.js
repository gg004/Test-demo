const config = require("../config");
const JwtService = require("../services/JwtService");

module.exports = function (options) {
  return function (req, res, next) {
    const token = JwtService.getToken(req);
    if (!token) {
      return res.status(401).json({
        error: true,
        message: "UNAUTHORIZED",
        code: "UNAUTHORIZED"
      });
    } else {
      const result = JwtService.verifyAccessToken(token, config.jwt_key, options);
      if (!result) {
        return res.status(401).json({
          error: true,
          message: "TOKEN_EXPIRED",
          code: "TOKEN_EXPIRED"
        });
      }

      req.user_id = result.user_id;
      req.role = result.role;
      next();
    }
  };
};
