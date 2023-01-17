const AuthService = require("../../services/AuthService");
const JwtService = require("../../services/JwtService");
const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
const UrlMiddleware = require("../../middleware/UrlMiddleware");
const HostMiddleware = require("../../middleware/HostMiddleware");
const PermissionMiddleware = require("../../middleware/PermissionMiddleware");
const DevLogService = require("../../services/DevLogService");
const MkdEventService = require("../../services/MkdEventService");
const MailService = require("../../services/MailService");
const config = require("../../config");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  //PermissionMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v3/api/custom/vaypoynt/company/recovery", middlewares, async function (req, res) {
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
      sdk.setTable("company_profile");

      let company_data = await sdk.get({
        user_id: result[0].id
      });

      if (typeof company_data == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (company_data.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Cannot find Company"
        });
      }

      if (company_data[0].recovery_email == null) {
        return res.status(403).json({
          error: true,
          message: "Cannot find a recovery email"
        });
      }

      const forgotResult = await service.forgot(sdk, req.projectId, req.body.email, result[0].id);

      if (typeof forgotResult == "string") {
        return res.status(403).json({
          error: true,
          message: forgotResult
        });
      }
      console.log("in here");

      const eventService = new MkdEventService(sdk, req.projectId, req.headers);

      sdk.setProjectId("manaknight");
      sdk.setTable("projects");

      const projectRow = await sdk.get({
        slug: req.projectId
      });

      sdk.setProjectId(req.projectId);

      await eventService.sendMail(
        {
          email: company_data[0].recovery_email,
          to: company_data[0].recovery_email,
          link: projectRow[0].project_id + ".io" + "/" + (req.body.role ? req.body.role : "admin") + "/reset?token=" + forgotResult.token,
          from: config.mail_user,
          code: forgotResult.code,
          token: forgotResult.token
        },
        "reset-password"
      );

      return res.status(200).json({
        error: false,
        message: "Email Sent"
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
};
