const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const PasswordService = require("../services/PasswordService");
const { sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware()
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  app.post("/v2/api/lambda/update/password", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");
      const result = await sdk.get({
        id: req.user_id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials"
        });
      }

      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Password missing",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      const hashPassword = await PasswordService.hash(req.body.password);

      await sdk.update(
        {
          password: hashPassword,
          update_at: sqlDateTimeFormat(new Date())
        },
        req.user_id
      );

      return res.status(200).json({
        error: false,
        message: "Updated"
      });
    } catch (err) {
      console.log(err);
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v2/api/lambda/admin/update/password", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");

      if (req.role !== "admin") {
        return res.status(403).json({
          error: true,
          message: "Invalid Access"
        });
      }

      const result = await sdk.get({
        id: req.body.id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials"
        });
      }

      if (!req.body.password) {
        return res.status(403).json({
          error: true,
          message: "Password missing",
          validation: [{ field: "password", message: "Password missing" }]
        });
      }

      //TODO validate password strength
      const hashPassword = await PasswordService.hash(req.body.password);

      await sdk.update(
        {
          password: hashPassword,
          update_at: sqlDateTimeFormat(new Date())
        },
        req.body.id
      );

      return res.status(200).json({
        error: false,
        message: "Updated"
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
      name: "Password Update API",
      url: "/v2/api/lambda/update/password",
      successBody: '{ "password": "a12345"}',
      successPayload: '{"error":false,message: "updated"}',
      errors: [
        {
          name: "403",
          body: '{ "password": "a12345"}',
          response: '{"error":true,"message":"Invalid Credentials"}'
        },
        {
          name: "403",
          body: "{}",
          response: '{"error":true,"message":"Invalid Credentials","validation":[{"field": "password", "message": "Password missing"}]}'
        },
        {
          name: "403",
          body: '{ "password": "a12345"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Password Update Admin API",
      url: "/v2/api/lambda/admin/update/password",
      successBody: '{ "password": "a12345"}',
      successPayload: '{"error":false,message: "updated"}',
      errors: [
        {
          name: "403",
          body: '{ "password": "a12345"}',
          response: '{"error":true,"message":"Invalid Credentials"}'
        },
        {
          name: "403",
          body: "{}",
          response: '{"error":true,"message":"Invalid Credentials","validation":[{"field": "password", "message": "Password missing"}]}'
        },
        {
          name: "403",
          body: '{ "password": "a12345"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    }
  ];
};
