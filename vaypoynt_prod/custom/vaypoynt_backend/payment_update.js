/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
const UrlMiddleware = require("../../middleware/UrlMiddleware");
const HostMiddleware = require("../../middleware/HostMiddleware");
const TokenMiddleware = require("../../middleware/TokenMiddleware");
const ValidationService = require("../../services/ValidationService");

const Stripe = require("stripe");
const config = require("../../config");

const stripeSecret = config.stripe.secret_key;

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware()
  // PermissionMiddleware,
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

const stripe = Stripe(stripeSecret);
module.exports = function (app) {
  app.post("/v3/api/custom/vaypoynt/company/payment/update", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (role != "company") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      }
      let { cardToken } = req.body;

      const validationResult = await ValidationService.validateObject(
        {
          cardToken: "required"
        },
        { cardToken }
      );
      if (validationResult.error) {
        return res.status(400).json(validationResult);
      }

      sdk.setTable("user");
      let user_data = await sdk.get({ id: user_id });
      const card = await stripe.customers.update(user_data[0].stripe_uid, {
        source: cardToken
      });

      return res.status(200).json({ error: false, message: "Card Updated" });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
};
