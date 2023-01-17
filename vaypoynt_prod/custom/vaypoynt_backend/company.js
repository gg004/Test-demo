/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
 const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
 const UrlMiddleware = require("../../middleware/UrlMiddleware");
 const HostMiddleware = require("../../middleware/HostMiddleware");
 const TokenMiddleware = require("../../middleware/TokenMiddleware");
 const { sqlDateFormat, sqlDateTimeFormat } = require("../../services/UtilService");
 const StripeService = require("../../services/StripeService");
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

module.exports = function (app) {
  app.post("/v3/api/custom/vaypoynt/company/PUT", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (role != "company") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      } else {
        sdk.setTable("company_profile");

        await sdk.updateWhere(req.body, {
          user_id: user_id
        });

        return res.status(200).json({ error: false, message: "Updated" });
      }
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.get("/v3/api/custom/vaypoynt/company/teams/pending-requests", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (role != "company") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      }

      sdk.setTable("company_profile");
      let company_data = await sdk.get({
        user_id: user_id
      });

      sdk.setTable("teams_pending_request");

      let pending_requests = await sdk.get({
        company_id: company_data[0].id
      });

      return res.status(200).json({ error: false, list: pending_requests });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/custom/vaypoynt/company/teams/approve/:request_id", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      let { request_id } = req.params;
      let { teams_id } = req.body;

      if (!teams_id) {
        return res.status(403).json({ error: true, message: "teams id is missing" });
      }

      if (role != "company") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      }

      sdk.setTable("teams_pending_request");

      let request_data = await sdk.get({
        id: request_id
      });

      sdk.setTable("employee_profile");

      await sdk.update({ teams_id: teams_id, teams_status: 1 }, request_data[0].employee_id);

      sdk.setTable("teams_pending_request");
      await sdk.deleteWhere({ id: request_id });

      return res.status(200).json({ error: false, message: "successfully added" });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/custom/vaypoynt/company/subscription/cancel", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (!role == "company") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      }
      const stripe = new StripeService();
      sdk.setTable("stripe_subscription");

      const priceTable = `${sdk.getProjectId()}_stripe_price`;
      const db = sdk.getDatabase();
      const [sub] = await db.query(
        `select sub.*, price.type as planType from ${sdk.getTable()} as sub left join ${priceTable} as price on sub.price_id = price.id where sub.status != 'canceled' and sub.user_id = ${user_id}`
      );

      if (!sub[0]) {
        return res.status(404).json({ error: true, message: "Subscription not found" });
      }

      if (sub[0].planType === "lifetime") {
        sdk.setTable("stripe_subscription");
        await sdk.update(
          {
            status: "canceled",
            update_at: sqlDateTimeFormat(new Date())
          },
          sub[0].id
        );
      } else {
        await stripe.cancelStripeSubscription({ subscriptionId: sub[0].stripe_id });
      }
      sdk.setTable("cancel_pending_request");

      let info = {
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        user_id: user_id
      };
      let result = await sdk.insert(info);
      sdk.setTable("user");

      await sdk.update({ status: 0 }, user_id);

      // await sdk.updateWhere({cancel_request: "pending"}, {user_id: user_id})
      // await sdk.deleteWhere({user_id: user_id})

      // sdk.setTable("user")
      // await sdk.deleteWhere({id: user_id})

      // sdk.setTable("employee_profile")
      // await sdk.updateWhere({company_id: null, department_id: null}, {company_id: company_data[0].id})
      // sdk.setTable("departement")
      // await sdk.deleteWhere({company_id: company_data[0].id})

      return res.status(200).json({ error: false, message: "Subscription is cancelled successfully" });
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