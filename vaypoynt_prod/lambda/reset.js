const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const DevLogService = require("../services/DevLogService");

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
  app.post("/v2/api/lambda/reset", middlewares, async function (req, res) {
    try {
      if (!req.body.token) {
        return res.status(403).json({
          error: true,
          message: "Invalid Reset Password Request",
          validation: [{ field: "token", message: "Invalid Reset Password Request" }]
        });
      }

      if (!req.body.code || isNaN(req.body.code)) {
        return res.status(403).json({
          error: true,
          message: "Invalid Reset Code",
          validation: [{ field: "code", message: "Invalid Reset Code" }]
        });
      }

      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Password Missing",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      let sdk = app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("token");

      const result = await sdk.get({
        token: req.body.token
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Invalid Reset Request"
        });
      }

      const data = JSON.parse(result[0].data);
      const code = data.code;

      logService.log(result[0].code, req.body.code);

      if (req.body.code != code) {
        return res.status(403).json({
          error: true,
          message: "Mismatch Reset Code",
          validation: [{ field: "code", message: "Mismatch Reset Code" }]
        });
      }

      let service = new AuthService();

      const resetResult = await service.reset(sdk, req.projectId, result[0], req.body.password);

      if (typeof resetResult == "string") {
        return res.status(403).json({
          error: true,
          message: resetResult
        });
      }

      return res.status(200).json({
        error: false,
        message: "Reset Password"
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
  app.post("/v2/api/lambda/mobile/reset", middlewares, async function (req, res) {
    try {
      if (!req.body.code || isNaN(req.body.code)) {
        return res.status(403).json({
          error: true,
          message: "Invalid Reset Code",
          validation: [{ field: "code", message: "Invalid Reset Code" }]
        });
      }

      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Password Missing",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      let sdk = app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("token");

      const result = await sdk.get({
        token: req.body.code
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Invalid Reset Request"
        });
      }

      const data = JSON.parse(result[0].data);
      const code = data.code;

      // logService.log(result[0].code, req.body.code);

      if (req.body.code != code) {
        return res.status(403).json({
          error: true,
          message: "Mismatch Reset Code",
          validation: [{ field: "code", message: "Mismatch Reset Code" }],
        });
      }

      let service = new AuthService();

      const resetResult = await service.reset(sdk, req.projectId, result[0], req.body.password);

      if (typeof resetResult == "string") {
        return res.status(403).json({
          error: true,
          message: resetResult
        });
      }

      return res.status(200).json({
        error: false,
        message: "Reset Password"
      });
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
      name: "Reset Password API",
      url: "/v2/api/lambda/reset",
      successBody: '{ "token": "token", "code": 234556, "password": "password"}',
      successPayload: '{"error": false,"message": "Reset Password"}',
      errors: [
        {
          name: "403",
          body: '{"code": 234556, "password": "password"}',
          response:
            '{"error": true,"message": "Invalid Reset Password Request","validation": [{ "field": "token", "message": "Invalid Reset Password Request" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "password": "password"}',
          response: '{"error": true,"message": "Invalid Reset Code","validation": [{ "field": "code", "message": "Invalid Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556}',
          response: '{"error": true, "message": "Password Missing", "validation": [{ "field": "password", "message": "Invalid Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556, "password": "password"}',
          response: '{"error": true, "message": "Invalid Reset Request"}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556, "password": "password"}',
          response: '{"error": true, "message": "Mismatch Reset Code", "validation": [{ "field": "code", "message": "Mismatch Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: false
    },
    {
      method: "POST",
      name: "Mobile Reset Password API",
      url: "/v2/api/lambda/mobile/reset",
      successBody: '{ "code": 234556, "password": "password"}',
      successPayload: '{"error": false,"message": "Reset Password"}',
      errors: [
        {
          name: "403",
          body: '{"code": 234556, "password": "password"}',
          response:
            '{"error": true,"message": "Invalid Reset Password Request","validation": [{ "field": "token", "message": "Invalid Reset Password Request" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "password": "password"}',
          response: '{"error": true,"message": "Invalid Reset Code","validation": [{ "field": "code", "message": "Invalid Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556}',
          response: '{"error": true, "message": "Password Missing", "validation": [{ "field": "password", "message": "Invalid Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556, "password": "password"}',
          response: '{"error": true, "message": "Invalid Reset Request"}'
        },
        {
          name: "403",
          body: '{"token": "token", "code": 234556, "password": "password"}',
          response: '{"error": true, "message": "Mismatch Reset Code", "validation": [{ "field": "code", "message": "Mismatch Reset Code" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: false
    }
  ];
};
