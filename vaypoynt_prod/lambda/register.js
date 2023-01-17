const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const DevLogService = require("../services/DevLogService");
const config = require("../config");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v2/api/lambda/register", middlewares, async function (req, res) {
    try {
      let verify = false;
      const needRefreshToken = req.body.is_refresh ? true : false;
      let refreshToken = undefined;
      if (!req.body.email) {
        return res.status(403).json({
          error: true,
          message: "Email Missing",
          validation: [{ field: "email", message: "Email missing" }]
        });
      }
      if (!req.body.role) {
        return res.status(403).json({
          error: true,
          message: "Role Missing",
          validation: [{ field: "role", message: "role missing" }]
        });
      }
      if (req.body.role === "admin") {
        verify = true;
        const userData = JwtService.verifyAccessToken(JwtService.getToken(req), config.jwt_key);
        if (!userData || userData.role != 'admin') {
          return res.status(403).json({
            error: true,
            message: "Admin can't be registered using this API",
            validation: [{ field: "role", message: "role (admin) is not allowed" }]
          });
        }
      }
      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Password Missing",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      let service = new AuthService();

      logService.log(req.projectId, req.body.email, req.body.password, req.body.role);

      const result = await service.register(req.app.get("sdk"), req.projectId, req.body.email, req.body.password, req.body.role, verify);

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      } else {
        if (needRefreshToken) {
          const refreshToken = JwtService.createAccessToken(
            {
              user_id: result.id,
              role: req.body.role
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
          role: req.body.role,
          token: JwtService.createAccessToken(
            {
              user_id: result,
              role: req.body.role
            },
            config.jwt_expire,
            config.jwt_key
          ),
          refresh_token: refreshToken,
          expire_at: config.jwt_expire,
          user_id: result
        });
      }
    } catch (err) {
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
      name: "Register API",
      url: "/v2/api/lambda/register",
      successBody: '{ "email": "a@gmail.com", "role": "member", "password": "a123456", "is_refresh": false}',
      successPayload: '{"error":false,"role":"member","token":"JWT Token","expire_at":3600,"user_id":20}',
      errors: [
        {
          name: "403",
          body: '{"role": "member", "password": "a123456", "is_refresh": false}',
          response: '{"error": true,"message": "Email Missing","validation": [{ "field": "email", "message": "Email missing" }]}'
        },
        {
          name: "403",
          body: '{ "email": "a@gmail.com", "password": "a123456", "is_refresh": false}',
          response: '{"error": true,"message": "Role Missing","validation": [{ "field": "role", "message": "Role missing" }]}'
        },
        {
          name: "403",
          body: '{ "email": "a@gmail.com", "role": "member", "is_refresh": false}',
          response: '{"error": true,"message": "Password","validation": [{ "field": "password", "message": "Password missing" }]}'
        },
        {
          name: "403",
          body: '{ "email": "a@gmail.com", "role": "member", "password": "a123456", "is_refresh": false}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    }
  ];
};
