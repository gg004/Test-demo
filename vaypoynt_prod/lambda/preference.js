const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  app.get("/v2/api/lambda/preference", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("profile");
      const result = await sdk.get({
        user_id: req.user_id,
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

      sdk.setTable("user");
      const userResult = await sdk.get({
        id: req.user_id,
      });

      if (userResult.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials",
        });
      }

      return res.status(200).json({
        ...result[0],
        first_name: userResult[0].first_name,
        last_name: userResult[0].last_name,
        email: userResult[0].email,
        role: userResult[0].role,
        phone: userResult[0].phone,
        photo: userResult[0].photo,
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message,
      });
    }
  });

  app.post("/v2/api/lambda/preference", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("profile");
      const result = await sdk.get({
        user_id: req.user_id,
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

      sdk.setTable("user");
      const userResult = await sdk.get({
        id: req.user_id,
      });

      if (userResult.length != 1) {
        return res.status(401).json({
          error: true,
          message: "Invalid Credentials",
        });
      }

      sdk.setTable("profile");
      const updateResult = await sdk.update(req.body.payload, result[0].id);

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
      name: "Preference API",
      url: "/v2/api/lambda/preference",
      successBody: "{}",
      successPayload:
        '{"id":1,"user_id":1,"create_at":"2022-01-01T04:00:00.000Z","update_at":"2022-01-01T04:00:00.000Z","first_name":"Admin F","last_name":"Admin L","email":"admin@manaknight.com","role":"admin","phone":"111 222 333","photo":"/image/profile.png"}',
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
      name: "Preference API",
      url: "/v2/api/lambda/preference",
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
