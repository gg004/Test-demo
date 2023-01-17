const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  PermissionMiddleware,
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  app.get("/v2/api/lambda/profile", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");
      console.log(req.user_id);
      const result = await sdk.get({
        id: req.user_id,
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result,
        });
      }

      if (result.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials",
        });
      }

      return res.status(200).json({
        first_name: result[0].first_name,
        email: result[0].email,
        role: result[0].role,
        last_name: result[0].last_name,
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message,
      });
    }
  });

  app.post("/v2/api/lambda/profile", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("user");
      const result = await sdk.get({
        id: req.user_id,
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result,
        });
      }

      if (result.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials",
        });
      }

      const updateResult = await sdk.update({
        first_name: req.body.payload.first_name,
        last_name: req.body.payload.last_name,
      }, req.user_id);

      if (updateResult == null) {
        return res.status(403).json({
          error: true,
          message: updateResult,
        });
      }

      return res.status(200).json({
        error: false,
        message: "Updated",
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message,
      });
    }
  });
  return [
    {
      method: "GET",
      name: "Profile API",
      url: "/v2/api/lambda/profile",
      successBody: "{}",
      successPayload: '{"first_name":"Admin F","email":"admin@manaknight.com","role":"admin","last_name":"Admin L"}',
      errors: [
        {
          name: "401",
          successBody: "{}",
          response: '{"error": true,"message": "Invalid Credentials"}',
        },
        {
          name: "403",
          body: "{}",
          response: '{"error": true,"message": "Some error message"}',
        },
      ],
      needToken: true,
    },
    {
      method: "POST",
      name: "Profile API",
      url: "/v2/api/lambda/profile",
      successBody: '{"payload" : {"first_name":"Admin F2","last_name":"Admin L2"}}',
      successPayload: '{"error":false,"message":"Updated"}',
      errors: [
        {
          name: "403",
          body: '{"payload" : {"first_name":"Admin F2","last_name":"Admin L2"}}',
          response: '{"error": true,"message": "Some error message"}',
        },
      ],
      needToken: true,
    },
  ];
};
