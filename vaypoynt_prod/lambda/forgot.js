const AuthService = require("../services/AuthService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");
const DevLogService = require("../services/DevLogService");
const MkdEventService = require("../services/MkdEventService");
const config = require("../config");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  PermissionMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v2/api/lambda/forgot", middlewares, async function (req, res) {
    try {
      if (!req.body.email) {
        return res.status(403).json({
          error: true,
          message: "Email Missing",
          validation: [{ field: "email", message: "Email missing" }]
        });
      }

      let service = new AuthService();
      let sdk = app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");
      const result = await sdk.get({
        email: req.body.email
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
          message: "Cannot find User"
        });
      }

      if (result[0].oauth) {
        return res.status(403).json({
          error: true,
          message: "Cannot do forgot password on single sign on"
        });
      }

      const forgotResult = await service.forgot(sdk, req.projectId, req.body.email, result[0].id);

      if (typeof forgotResult == "string") {
        return res.status(403).json({
          error: true,
          message: forgotResult
        });
      }

      const eventService = new MkdEventService(sdk, req.projectId, req.headers);

      sdk.setProjectId("manaknight");
      sdk.setTable("projects");

      const projectRow = await sdk.get({
        slug: req.projectId
      });

      sdk.setProjectId(req.projectId);

      await eventService.sendMail(
        {
          email: req.body.email,
          to: req.body.email,
          link: projectRow[0].hostname + '/' + (req.body.role ? req.body.role : 'admin') + '/reset?token=' + forgotResult.token,
          from: config.mail_user,
          code: forgotResult.code,
          token: forgotResult.token
        },
        "reset-password"
      );

      return res.status(200).json({
        error: false,
        message: "Email Sent",
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v2/api/lambda/mobile/forgot", middlewares, async function (req, res) {
    try {
      if (!req.body.email) {
        return res.status(403).json({
          error: true,
          message: "Email Missing",
          validation: [{ field: "email", message: "Email missing" }]
        });
      }

      let service = new AuthService();
      let sdk = app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");
      const result = await sdk.get({
        email: req.body.email
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
          message: "Cannot find User"
        });
      }

      if (result[0].oauth) {
        return res.status(403).json({
          error: true,
          message: "Cannot do forgot password on single sign on"
        });
      }

      const forgotResult = await service.mobileForgot(sdk, req.projectId, req.body.email, result[0].id);

      if (typeof forgotResult == "string") {
        return res.status(403).json({
          error: true,
          message: forgotResult
        });
      }

      const eventService = new MkdEventService(sdk, req.projectId, req.headers);

      sdk.setProjectId("manaknight");
      sdk.setTable("projects");

      const projectRow = await sdk.get({
        slug: req.projectId
      });

      sdk.setProjectId(req.projectId);

      await eventService.sendMail(
        {
          email: req.body.email,
          to: req.body.email,
          from: config.mail_user,
          code: forgotResult.code,
        },
        "reset-mobile-password"
      );

      return res.status(200).json({
        error: false,
        message: "Email Sent",
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
      name: "Forgot Password API",
      url: "/v2/api/lambda/forgot",
      successBody: '{ "email": "a@gmail.com", "role": "admin"}',
      successPayload: '{"error": false, "message": "Email Sent"}',
      errors: [
        {
          name: "403",
          body: '{"password": "123456", "role": "admin"}',
          response: '{"error": true,"message": "Email Missing","validation": [{ "field": "email", "message": "Email missing" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true, "message": "Cannot find user"}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true, "message": "Cannot do forgot password on single sign on"}'
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
      name: "Mobile Forgot Password API",
      url: "/v2/api/lambda/mobile/forgot",
      successBody: '{ "email": "a@gmail.com"}',
      successPayload: '{"error": false, "message": "Email Sent"}',
      errors: [
        {
          name: "403",
          body: '{"password": "123456", "role": "admin"}',
          response: '{"error": true,"message": "Email Missing","validation": [{ "field": "email", "message": "Email missing" }]}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true, "message": "Cannot find user"}'
        },
        {
          name: "403",
          body: '{"email": "a@gmail.com"}',
          response: '{"error": true, "message": "Cannot do forgot password on single sign on"}'
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
