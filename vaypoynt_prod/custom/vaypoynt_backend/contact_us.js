/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
const UrlMiddleware = require("../../middleware/UrlMiddleware");
const HostMiddleware = require("../../middleware/HostMiddleware");
const MkdEventService = require("../../services/MkdEventService");

const config = require("../../config");
const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  // TokenMiddleware()
  // PermissionMiddleware,
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  app.post("/v3/api/custom/vaypoynt/company/contact_us", middlewares, async function (req, res) {
    try {
      let { email, name, message } = req.body;
      if (!email) {
        return res.status(403).json({
          error: true,
          message: "Email Missing",
          validation: [{ field: "email", message: "Email missing" }]
        });
      }
      if (!name) {
        return res.status(403).json({
          error: true,
          message: "Name Missing",
          validation: [{ field: "name", message: "Name missing" }]
        });
      }
      if (!message) {
        return res.status(403).json({
          error: true,
          message: "Message Missing",
          validation: [{ field: "message", message: "Message missing" }]
        });
      }
      let sdk = app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      const eventService = new MkdEventService(sdk, req.projectId, req.headers);

      sdk.setProjectId("manaknight");
      sdk.setTable("projects");

      const projectRow = await sdk.get({
        slug: req.projectId
      });

      sdk.setProjectId(req.projectId);

      await eventService.sendMail(
        {
          email: email,
          to: "support@vaypoynt.com",
          from: config.mail_user,
          message: message,
          name: name
        },
        "contact"
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
