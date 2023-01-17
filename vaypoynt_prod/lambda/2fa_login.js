const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const DevLogService = require("../services/DevLogService");
const config = require("../config");
const TwoFactorService = require("../services/TwoFactorService");
const LambdaPermissionMiddleware = require("../middleware/LambdaPermissionMiddleware");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  // LambdaPermissionMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v2/api/lambda/2fa/login", middlewares, async function (req, res) {
    try {
      if (!req.body.email) {
        return res.status(403).json({
          error: true,
          message: "Invalid Credentials",
          validation: [{ field: "email", message: "Email missing" }]
        });
      }
      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Invalid Credentials",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }
      if (!req.body.role) {
        return res.status(403).json({
          error: true,
          message: "Invalid Role",
          validation: [{ field: "role", message: "Role missing" }]
        });
      }
      let service = new AuthService();
      logService.log(req.projectId, req.body.email, req.body.password);

      const result = await service.login(req.app.get("sdk"), req.projectId, req.body.email, req.body.password, req.body.role);

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      } else {
        logService.log(req.projectId, result.role_id);

        const twoFaPayload = await TwoFactorService.getTwoFactorAuthenticationCode(req.projectId);
        const qrCode = await TwoFactorService.getDataURL(twoFaPayload.otpauthUrl);

        return res.status(200).json({
          error: false,
          role: req.body.role,
          qr_code: qrCode,
          one_time_token: JwtService.createAccessToken(
            {
              user_id: result.id,
              role: req.body.role,
              nonce: (Math.random() + 1).toString(36).substring(7)
            },
            60,
            config.jwt_key
          ),
          expire_at: 60,
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

  app.post("/v2/api/lambda/2fa/auth", middlewares, async function (req, res) {
    try {
      if (!req.body.code) {
        return res.status(403).json({
          error: true,
          message: "Invalid Code",
          validation: [{ field: "code", message: "Code missing" }]
        });
      }
      if (!req.body.token) {
        return res.status(403).json({
          error: true,
          message: "Token Invalid",
          validation: [{ field: "token", message: "Token missing" }]
        });
      }
      const verifyToken = JwtService.verifyAccessToken(req.body.token, config.jwt_key);

      if (verifyToken && verifyToken.nonce) {
        return res.status(200).json({
          error: false,
          role: verifyToken.role,
          token: JwtService.createAccessToken(
            {
              user_id: verifyToken.user_id,
              role: verifyToken.role
            },
            config.jwt_expire,
            config.jwt_key
          ),
          expire_at: config.jwt_expire,
          user_id: verifyToken.user_id
        });
      } else {
        return res.status(403).json({
          error: true,
          message: "Invalid Credential",
          validation: [{ field: "code", message: "Invalid Credentials" }]
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
      name: "2FA Login API",
      url: "/v2/api/lambda/2fa/login",
      successBody: '{    "email": "a@gmail.com",    "password": "123456",    "role": "admin"}',
      successPayload: '{"error": false,"role": "admin","qr_code": "qrCode","one_time_token": "token","expire_at": 60,"user_id": 1}',
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
    },
    {
      method: "POST",
      name: "2FA Auth API",
      url: "/v2/api/lambda/2fa/auth",
      successBody: '{\n    "code": "abc",\n    "token": "token"\n}',
      successPayload: '{"error": false,"role": "admin","token": "token","expire_at": 60,"user_id": 1}',
      errors: [
        {
          name: "403",
          body: '{ "code": "a", "token": "123456"}',
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "code", "message": "Invalid Credential" }]}'
        },
        {
          name: "403",
          body: '{"token": "a"}',
          response: '{"error": true,"message": "Token Invalid","validation": [{ "field": "token", "message": "Token missing" }]}'
        },
        {
          name: "403",
          body: '{"code": "123456"}',
          response: '{"error": true,"message": "Invalid Code","validation": [{ "field": "code", "message": "Code missing" }]}'
        },
        {
          name: "403",
          body: '{    "code": "a",    "token": "123456"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: false
    }
  ];
};
