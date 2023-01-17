const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const LogMiddleware = require("../middleware/LogMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");
const RateLimitMiddleware = require("../middleware/RateLimitMiddleware");
const DevLogService = require("../services/DevLogService");
const config = require("../config");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  // HostMiddleware,
  // PermissionMiddleware,
  RateLimitMiddleware,
  LogMiddleware
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v2/api/lambda/login", middlewares, async function (req, res) {
    try {
      let service = new AuthService();
      let refreshToken = undefined;
      const needRefreshToken = req.body.is_refresh ? true : false;
      const { email, password, role } = req.body;
      if (!password || !email || !role) {
        return res.status(403).json({
          error: true,
          message: "Invalid Credentials",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      logService.log(req.projectId, email, password);
      const result = await service.login(app.get("sdk"), req.projectId, email, password, role);

      if (!result.status || !result.verify) {
        return res.status(403).json({
          error: true,
          message: "Failed to login"
        });
      }

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      } else {
        logService.log(req.projectId, result.role_id);
        //TODO: Use the secret from project

        if (needRefreshToken) {
          refreshToken = JwtService.createAccessToken(
            {
              user_id: result.id,
              role: role
            },
            config.refresh_jwt_expire,
            config.jwt_key
          );
          let expireDate = new Date();
          expireDate.setSeconds(expireDate.getSeconds() + config.refresh_jwt_expire);
          await service.saveRefreshToken(app.get("sdk"), req.projectId, result.id, refreshToken, expireDate);
        }

        return res.status(200).json({
          error: false,
          role,
          token: JwtService.createAccessToken(
            {
              user_id: result.id,
              role
            },
            config.jwt_expire,
            config.jwt_key
          ),
          refresh_token: refreshToken,
          expire_at: config.jwt_expire,
          user_id: result.id
        });
      }
    } catch (err) {
      // console.error(err);
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
  return [
    {
      method: "POST",
      name: "Regular Login API",
      url: "/v2/api/lambda/login",
      successBody: '{ "email": "a@gmail.com",    "password": "123456",    "role": "admin", "is_refresh": false}',
      successPayload: '{"error": false,"role": "admin","token": "token","refresh_token": "only if is_refresh true","expire_at": 60,"user_id": 1}',
      errors: [
        {
          name: "403",
          body: '{"password": "123456", "role": "admin"}',
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "email", "message": "Email missing" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com",  "role": "admin"}',
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "password", "message": "Password missing" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com", "password": "123456"}',
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "role", "message": "Role missing" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com", "password": "123456",    "role": "admin"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: false
    }
  ];
};
