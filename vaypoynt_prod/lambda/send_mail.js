const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const { sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");
const MailService = require("../services/MailService");
const config = require("../config");
const ValidationService = require("../services/ValidationService");

const middlewares = [ProjectMiddleware, UrlMiddleware, HostMiddleware];

module.exports = function (app) {
  app.post("/v2/api/lambda/mail/send", middlewares, async function (req, res) {
    try {
      const validationResult = await ValidationService.validateInputMethod(
        {
          to: "required",
          from: "required",
          subject: "required",
          body: "required",
        },
        {
          to: "to is required",
          from: "from is required",
          subject: "subject is required",
          body: "body is required",
        },
        req
      );

      if (validationResult.error) {
        return res.status(403).json(validationResult);
      }

      //TODO template selection
      MailService.initialize(config);
      const result = await MailService.send(req.body.from, req.body.to, req.body.subject, req.body.body);

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result,
        });
      }

      console.log("Mail Response:", result);
      if (result.error) {
        return res.status(403).json(result);
      } else {
        return res.status(200).json({
          error: false,
          message: "Email Sent",
        });
      }
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
      method: "POST",
      name: "Send Mail API",
      url: "/v2/api/lambda/mail/send",
      successBody: '{ "from": "from@gmail.com", "to": "receiver@gmail.com", "subject": "subject line", "body": "body text"}',
      successPayload: '{"error":false,"message":"Email Sent"}',
      errors: [
        {
          name: "403",
          body: "",
          response:
            '{"error":true,"message":"Validation Error","validation":{"to":"to is required","subject":"subject is required","from":"from is required","body":"body is required"}}',
        },
        {
          name: "403",
          body: '{ "subject": "subject line", "body": "body text"}',
          response: '{"error":true,"message":"Validation Error","validation":{"to":"to is required","from":"from is required"}}',
        },
        {
          name: "403",
          body: '{ "from": "from@gmail.com", "to": "receiver@gmail.com", "subject": "subject line", "body": "body text"}',
          response: '{"error":true,"message":"Invalid login: 535 Authentication failed"}',
        },
        {
          name: "403",
          body: '{ "from": "from@gmail.com", "to": "receiver@gmail.com", "subject": "subject line", "body": "body text"}',
          response: '{"error": true,"message": "Some error message"}',
        },
      ],
      needToken: true,
    },
  ];
};
