const JwtService = require("../services/JwtService");
const StripeService = require("../services/StripeService");
const ValidationService = require("../services/ValidationService");
const AuthService = require("../services/AuthService");
const TokenMiddleware = require("../middleware/TokenMiddleware");

const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const SyncStripeWebhook = require("../middleware/SyncStripeWebhook");
const config = require("../config");

const {
  sqlDateFormat,
  sqlDateTimeFormat,
  filterEmptyFields,
} = require("../services/UtilService");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  //SyncStripeWebhook,
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  const sdk = app.get("sdk");
  const stripe = new StripeService();
  function jsonExtractor(object, property) {
    return `json_unquote(json_extract(${object}, '$.${property}'))`;
  }
  /**
   * products
   * get all
   * get one
   * create one
   * update one
   * archive one //TODO
   */
  app.get(
    "/v2/api/lambda/stripe/products",
    middlewares,
    TokenMiddleware({ role: "admin|user" }),
    async function (req, res) {
      try {
        let { limit, page, name, stripe_id, status } = req.query;
        /**
         * get products
         */
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_product");
        const db = sdk.getDatabase();

        let fields = filterEmptyFields({ name, stripe_id, status });
        let where = [];
        Object.entries(fields).forEach(([key, value]) => {
          if (key === "status") {
            where.push(`${key} = ${+value}`);
          } else {
            where.push(`${key} LIKE '%${value}%'`);
          }
        });

        if (limit === "all") {
          const [[...resource]] = await db.query(
            `SELECT * from ${sdk.getTable()} WHERE ${
              where.length ? where.join(" AND ") : 1
            }`
          );
          return res.status(200).json({ error: false, list: resource });
        }
        const total = await sdk.countStr(where);
        const num_pages = Math.ceil(+total / +limit);
        const resource = await sdk.paginateStr(where, "*", +page, +limit);

        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit: +limit,
            num_pages,
            page: +page,
          });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        });
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/product/:id",
    middlewares,
    TokenMiddleware({ role: "admin|user" }),
    async function (req, res) {
      try {
        /**
         * get a product
         */
        const { id } = req.params;
        if (!id) {
          return res
            .status(400)
            .json({ error: true, message: "Product id is missing" });
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_product");

        const product = await sdk.get({ id: id });
        if (!product[0])
          return res
            .status(404)
            .json({ error: true, message: "Product not found" });
        res.status(200).json({ error: false, model: product[0] });
      } catch (err) {
        res.status(500).json({
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        });
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/product",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * create product
         */
        const { name, description } = req.body;
        const validationResult = await ValidationService.validateObject(
          { name: "required" },
          { name }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_product");
        const product = await stripe.createStripeProduct({
          name: name,
          description: description,
          metadata: {
            projectId: sdk.getProjectId(),
          },
        });

        const data = await sdk.insert({
          stripe_id: product.id,
          name: name,
          object: JSON.stringify(product),
          status: 1,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        res.status(200).json({
          error: false,
          model: data,
          message: "Product created successfully",
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.put(
    "/v2/api/lambda/stripe/product/:id",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * create product
         */
        const { id } = req.params;
        if (!id) {
          return res
            .status(400)
            .json({
              error: true,
              message: "Parameter/s missing",
              validation: { id: "Id is required" },
            });
        }
        const { name, description, status } = req.body;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_product");

        const productExists = await sdk.get({ id: id });
        if (!productExists.length)
          return res
            .status(404)
            .json({ error: true, message: "Product not found" });

        const product = await stripe.updateStripeProduct(
          productExists[0].stripe_id,
          {
            name,
            description,
            active: status,
          }
        );

        await sdk.update(
          {
            name,
            object: JSON.stringify(product),
            status: status,
          },
          productExists[0].id
        );

        res.status(200).json({
          error: false,
          message: "Product updated successfully",
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * prices
   * get all
   * get one
   * create one
   * update one
   * archive one //TODO
   */

  app.get(
    "/v2/api/lambda/stripe/prices",
    middlewares,
    async function (req, res) {
      try {
        /**
         * get plans/prices
         */
        let {
          limit,
          page,
          stripe_id,
          product_name,
          status,
          type,
          name,
          amount,
          order_by,
          direction,
        } = req.query;

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const productTable = `${sdk.getProjectId()}_stripe_product`;
        let query = filterEmptyFields({
          stripe_id,
          product_name,
          status,
          type,
          name,
          amount,
        });

        let where = [];
        Object.entries(query)?.forEach(([key, value]) => {
          switch (key) {
            case "stripe_id": {
              where.push(`price.stripe_id LIKE '%${value}%'`);
              break;
            }
            case "product_name": {
              where.push(`product.name LIKE '%${value}%'`);
              break;
            }
            case "status": {
              where.push(`price.status = ${+value}`);
              break;
            }
            case "type": {
              let finalQuery = [];
              value = value.split(",");
              for (const item of value) {
                finalQuery.push(`price.type = '${item}'`);
              }
              where.push(finalQuery.join(" OR "));
              break;
            }
            case "name": {
              where.push(`price.name = '${value}'`);
              break;
            }
            case "amount": {
              where.push(`price.amount <= ${+value}`);
              break;
            }
          }
        });

        let sqlQuery = `
        SELECT price.id as id, ${jsonExtractor(
          "price.object",
          "currency"
        )} as currency,
          price.stripe_id, price.name, price.amount, price.type, price.status, price.object,
          product.id as productId, product.name as product_name 
        from ${priceTable} as price 
        LEFT JOIN ${productTable} as product ON price.product_id = product.id 
        WHERE ${where.length ? where.join(" AND ") : 1}
      `;

        if (limit === "all") {
          const [[...resource]] = await db.query(sqlQuery);
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(
          `SELECT COUNT(*) as count from ${priceTable} as price LEFT JOIN ${productTable} as product ON price.product_id = product.id 
        WHERE ${where.length ? where.join(" AND ") : 1}`
        );
        const [[...resource]] = await db.query(`
        ${sqlQuery}
        LIMIT ${(+page - 1) * +limit}, ${+limit}
      `);

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/price/:id",
    middlewares,
    TokenMiddleware({ role: "admin|user" }),
    async function (req, res) {
      try {
        /**
         * get plan/price
         */
        const { id } = req.params;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_price");

        const price = await sdk.get({ id: id });

        if (!price[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Price not found" });
        }

        res.status(200).json({ error: false, model: price[0] });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/price",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * create plan/price
         * req.body.product_id is the db id of product
         */
        let {
          product_id,
          name,
          amount,
          type,
          interval,
          interval_count,
          trial_days,
          usage_type,
          usage_limit,
        } = req.body;
        const validationResult = await ValidationService.validateObject(
          {
            product_id: "required",
            name: "required",
            amount: "required",
            type: "required",
          },
          { product_id, name, amount, type }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_product");

        const product = await sdk.get({ id: product_id });

        if (!product.length) {
          return res
            .status(404)
            .json({ error: true, message: "Product not found" });
        }

        const product_stripe_id = product[0]?.stripe_id;

        sdk.setTable("stripe_setting");
        const setting = await sdk.get({ key: "currency" });

        let currency = stripe.getConfig().currency ?? "usd";
        if (setting[0]) currency = setting[0].value;
        currency = currency.toLowerCase();

        // if type recurring check if it is metered or not
        let price, model;
        sdk.setTable("stripe_price");

        const metadata = {
          projectId: sdk.getProjectId(),
        };

        if (type === "one_time") {
          price = await stripe.createStripeOnetimePrice({
            productId: product_stripe_id,
            name,
            amount,
            currency,
            metadata,
          });

          model = await sdk.insert({
            name: name,
            amount: parseFloat(amount),
            stripe_id: price.id,
            type: "one_time",
            product_id: product[0].id,
            object: JSON.stringify(price),
            status: 1,
            create_at: sqlDateFormat(new Date()),
            update_at: sqlDateTimeFormat(new Date()),
          });
        } else if (type === "recurring") {
          if (usage_type === "licenced") {
            price = await stripe.createStripeRecurringPrice({
              productId: product_stripe_id,
              name,
              amount,
              currency,
              interval,
              interval_count,
              trial_days,
              metadata,
            });
          } else if (usage_type === "metered") {
            price = await stripe.createStripeRecurringMeteredPrice({
              productId: product_stripe_id,
              name,
              amount,
              currency,
              usage_limit,
              usage_type,
              interval,
              interval_count,
              trial_days,
              metadata,
            });
          }

          model = await sdk.insert({
            stripe_id: price.id,
            product_id: product[0].id,
            name: name,
            object: JSON.stringify(price),
            amount: parseFloat(amount),
            type: interval === "lifetime" ? "lifetime" : type,
            is_usage_metered: usage_type === "metered" ? true : false,
            usage_limit:
              type === "one_time"
                ? null
                : !isNaN(+usage_limit) && usage_type === "metered"
                ? +usage_limit
                : null,
            status: 1,
            create_at: sqlDateFormat(new Date()),
            update_at: sqlDateTimeFormat(new Date()),
          });
        }

        res.status(200).json({
          error: false,
          model: model,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        return res.status(500).json(payload);
      }
    }
  );
  app.put(
    "/v2/api/lambda/stripe/price/:id",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * update plan/price
         * handle update later
         */

        const { id } = req.params;
        if (!id) {
          return res.status(401).json({
            error: true,
            message: "Price id is missing",
            validation: { id: "Price id is missing" },
          });
        }
        const { name, status } = req.body;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_price");

        const price = await sdk.get({ id });
        if (!price.length) {
          return res.status(404).json({
            error: true,
            message: "Price not found",
          });
        }

        const priceUpdated = await stripe.updateStripePrice({
          price_id: price[0].stripe_id,
          name,
          status,
        });

        await sdk.update(
          {
            name,
            status,
            object: JSON.stringify(priceUpdated),
            update_at: sqlDateTimeFormat(new Date()),
          },
          id
        );

        res.status(200).json({ error: false, model: price });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/price",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * delete plan/price
         */
        const { id } = req.params;
        if (!id) {
          return res.status(403).json({
            error: true,
            message: "Parameter/s missing",
            validation: [{ id: "Price id is missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_price");
        const price = sdk.get({ id: id });
        if (!price.length) {
          res.status(404).json({ error: true, message: "Price not found" });
        }

        const price_stripe_id = price[0].stripe_id;
        await stripe.deactivateStripePrice({ price_id: price_stripe_id });
        await sdk.update({ status: 0 }, id);

        res
          .status(200)
          .json({ error: false, message: "Price is deactivated successfully" });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * customer subscription
   * get
   * create
   * register -> create
   * update
   * cancel
   */
  app.get(
    "/v2/api/lambda/stripe/customer/subscription",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * check id exists
         * check customer exists
         * return customer subscription with the plan name and id
         */

        const user_id = req.user_id;

        sdk.setProjectId(req.projectId);
        const db = sdk.getDatabase();
        const userTable = `${sdk.getProjectId()}_user`;
        const stripeSubTable = `${sdk.getProjectId()}_stripe_subscription`;
        const stripePriceTable = `${sdk.getProjectId()}_stripe_price`;

        const [customer] = await db.query(`
        SELECT u.*, s.id as subId, p.id AS planId
        FROM ${userTable} AS u LEFT JOIN ${stripeSubTable} AS s ON s.user_id = u.id AND (s.status = 'active' OR s.status = 'trialing') LEFT JOIN ${stripePriceTable} AS p ON s.price_id = p.id WHERE u.id = ${user_id} ;
      `);

        return res.status(200).json({
          error: false,
          customer: customer[0],
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/customer/subscriptions",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * get subscriptions
         */
        let { limit, page } = req.query;

        sdk.setProjectId(req.projectId);
        const user_id = req.user_id;
        const db = sdk.getDatabase();
        const subscriptionTable = `${sdk.getProjectId()}_stripe_subscription`;
        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const userTable = `${sdk.getProjectId()}_user`;

        let query = filterEmptyFields({
          user_id,
        });

        let where = [];
        Object.entries(query)?.forEach(([key, value]) => {
          switch (key) {
            case "user_id": {
              where.push(`sub.user_id = ${+value} `);
              break;
            }
          }
        });

        let sqlQuery = `
          SELECT sub.id as subId, 
            ${jsonExtractor("sub.object", "created")} as createdAt,
            ${jsonExtractor(
              "sub.object",
              "current_period_start"
            )} as currentPeriodStart,
            ${jsonExtractor(
              "sub.object",
              "current_period_end"
            )} as currentPeriodEnd,
            sub.status as status,
            price.name as planName, price.type as planType, price.amount as planAmount, price.trial_days as trialDays,
            user.email as userEmail
          from ${subscriptionTable} as sub
          LEFT JOIN ${priceTable} as price ON sub.price_id = price.id
          LEFT JOIN ${userTable} as user ON sub.user_id = user.id
          WHERE ${where.length ? where.join(" AND ") : 1}`;

        if (limit === "all") {
          const [[...resource]] = await db.query(sqlQuery);
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(
          `SELECT COUNT(*) as count from ${subscriptionTable} as sub
          LEFT JOIN ${priceTable} as price ON sub.price_id = price.id        
          LEFT JOIN ${userTable} as user ON sub.user_id = user.id
          WHERE ${where.length ? where.join(" AND ") : 1} `
        );
        const [[...resource]] = await db.query(
          `${sqlQuery}
          LIMIT ${(+page - 1) * +limit}, ${+limit}
          `
        );

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/customer/subscription",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        const { planId } = req.body;
        const validationResult = await ValidationService.validateObject(
          {
            planId: "required",
          },
          { planId }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const userId = req.user_id;
        const userTable = `${sdk.getProjectId()}_user`;
        const stripeSubTable = `${sdk.getProjectId()}_stripe_subscription`;
        const stripePriceTable = `${sdk.getProjectId()}_stripe_price`;

        const [customer] = await db.query(`
        SELECT u.*, s.id as subId, s.stripe_id as subStripeId,
        ${jsonExtractor(
          "s.object",
          "items.data[0].id"
        )} as subItemId, p.id AS planId, p.type as planType
        FROM ${userTable} AS u LEFT JOIN ${stripeSubTable} AS s ON s.user_id = u.id AND (s.status = 'active' OR s.status = 'trialing') 
        LEFT JOIN ${stripePriceTable} AS p ON s.price_id = p.id 
        WHERE u.id = ${userId} ;
      `);

        if (!customer[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Customer not found" });
        }

        if (customer[0].subId) {
          return res
            .status(401)
            .json({
              error: true,
              message: "Customer already has an active subscription",
            });
        }

        const stripeCustomer = await stripe.retrieveStripeCustomer({
          customerId: customer[0].stripe_uid,
        });
        if (
          !stripeCustomer.default_source &&
          !stripeCustomer.sources?.data?.length
        ) {
          return res
            .status(403)
            .json({
              error: true,
              message:
                "You don't have a valid card attached, please add one and try again",
            });
        }

        sdk.setTable("stripe_price");
        const metadata = {
          projectId: sdk.getProjectId(),
        };

        const plan = await sdk.get({ id: planId });
        if (!plan[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Plan not found" });
        }
        await stripe.createStripeSubscription({
          customerId: customer[0].stripe_uid,
          priceId: plan[0].stripe_id,
          default_payment_method:
            stripeCustomer.default_source || stripeCustomer.sources.data[0].id,
          trial_from_plan: true,
          metadata,
        });

        res
          .status(200)
          .json({ error: false, message: "User subscribed successfully" });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message || "Something went wrong",
        };
        return res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/subscription/usage-charge",
    middlewares,
    TokenMiddleware({ role: "admin|user" }),
    async function (req, res) {
      try {
        const { subId, quantity } = req.body;
        const validationResult = await ValidationService.validateObject(
          {
            subId: "required",
            quantity: "required",
          },
          { subId, quantity }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const stripeSubTable = `${sdk.getProjectId()}_stripe_subscription`;

        const [sub] = await db.query(`
        SELECT ${jsonExtractor("s.object", "items.data[0].id")} as subItemId
        FROM ${stripeSubTable} as s
        WHERE s.id = ${subId} and (s.status = 'active' OR s.status = 'trialing');
      `);

        if (!sub[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Subscription is not found" });
        }

        const charge = await stripe.createUsageCharge({
          subItemId: sub[0].subItemId,
          quantity,
        });
        await res
          .status(200)
          .json({
            error: false,
            message: "Charge recorded successfully",
            model: charge,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message || "Something went wrong",
        };
        return res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/customer/register-subscribe",
    middlewares,
    async function (req, res) {
      try {
        const role = "user";
        const { planId, first_name, last_name, email, password, cardToken } =
          req.body;
        const validationResult = await ValidationService.validateObject(
          {
            planId: "required",
            email: "required",
            password: "required",
            cardToken: "required",
          },
          { planId, email, cardToken, password }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);

        sdk.setTable("stripe_price");
        const plan = await sdk.get({ id: planId });
        if (!plan[0]) {
          return res.status(404).json({
            error: true,
            message: "Plan not found",
          });
        }

        /**
         * create customer with the card, create subscription
         */
        const service = new AuthService();
        const result = await service.register(
          sdk,
          sdk.getProjectId(),
          email,
          password,
          role
        );
        if (typeof result == "string") {
          return res.status(403).json({
            error: true,
            message: result,
          });
        }
        const metadata = {
          projectId: sdk.getProjectId(),
        };

        const customer = await stripe.createStripeCustomerWithCard({
          email,
          tokenId: cardToken,
          metadata,
        });
        sdk.setTable("user");
        await sdk.update({ stripe_uid: customer.id }, result);

        await stripe.createStripeSubscription({
          customerId: customer.id,
          priceId: plan[0].stripe_id,
          default_payment_method: customer.default_source,
          trial_from_plan: true,
          metadata,
        });

        res.status(200).json({
          error: false,
          message: "User registered & subscribed successfully",
          role,
          token: JwtService.createAccessToken(
            {
              user_id: result,
              role,
            },
            config.jwt_expire,
            config.jwt_key
          ),
          expire_at: config.jwt_expire,
          user_id: result,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message || "Something went wrong",
        };
        return res.status(500).json(payload);
      }
    }
  );
  app.put(
    "/v2/api/lambda/stripe/customer/subscription",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      /**
       * get user_id, get his current active subscription and the type of it
       * either a normal recurring one or a lifetime one.
       * if normal change get the subitem and change the price
       * if lifetime mark it as cancelled and create new subscription
       */
      try {
        const {
          //  userId,
          activeSubscriptionId,
          newPlanId,
        } = req.body;

        const validationResult = await ValidationService.validateObject(
          {
            // userId: "required",
            activeSubscriptionId: "required",
            newPlanId: "required",
          },
          {
            // userId,
            activeSubscriptionId,
            newPlanId,
          }
        );

        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }
        const userId = req.user_id;
        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const userTable = `${sdk.getProjectId()}_user`;
        const stripeSubTable = `${sdk.getProjectId()}_stripe_subscription`;
        const stripePriceTable = `${sdk.getProjectId()}_stripe_price`;

        const [customer] = await db.query(`
        SELECT u.*, s.id as subId, s.stripe_id as subStripeId, 
        ${jsonExtractor(
          "s.object",
          "items.data[0].id"
        )} as subItemId, p.id AS planId, p.type as planType
        FROM ${userTable} AS u LEFT JOIN ${stripeSubTable} AS s ON s.user_id = u.id AND (s.status = 'active' OR s.status = 'trialing') 
        LEFT JOIN ${stripePriceTable} AS p ON s.price_id = p.id 
        WHERE u.id = ${userId} ;
      `);

        if (!customer[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Customer not found" });
        }

        if (customer[0].subId !== activeSubscriptionId) {
          return res
            .status(404)
            .json({
              error: true,
              message:
                "Passed subscription id doesn't match the customer record",
            });
        }

        const stripeCustomer = await stripe.retrieveStripeCustomer({
          customerId: customer[0].stripe_uid,
        });
        if (
          !stripeCustomer.default_source &&
          !stripeCustomer.sources?.data?.length
        ) {
          return res
            .status(403)
            .json({
              error: true,
              message:
                "You don't have a valid card attached, please add one and try again",
            });
        }

        sdk.setTable("stripe_price");
        const newPlan = await sdk.get({ id: newPlanId });
        if (!newPlan[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Plan not found" });
        }
        const metadata = {
          projectId: sdk.getProjectId(),
        };
        if (
          customer[0].planType === "lifetime" &&
          newPlan[0].type === "recurring"
        ) {
          /**
           * TODO: should be somewhat refunded
           */
          const subscription = await stripe.createStripeSubscription({
            customerId: customer[0].stripe_uid,
            priceId: newPlan[0].stripe_id,
            default_payment_method:
              stripeCustomer.default_source ||
              stripeCustomer.sources.data[0].id,
            metadata,
          });

          sdk.setTable("stripe_subscription");
          await sdk.update(
            {
              status: "canceled",
              update_at: sqlDateTimeFormat(new Date()),
            },
            customer[0].subId
          );
        } else if (
          customer[0].planType === "recurring" &&
          newPlan[0].type === "recurring"
        ) {
          const updatedSubscription = await stripe.changeStripeSubscriptionPlan(
            {
              subscriptionId: customer[0].subStripeId,
              subItemId: customer[0].subItemId,
              newPriceId: newPlan[0].stripe_id,
            }
          );
        } else if (
          customer[0].planType === "recurring" &&
          newPlan[0].type === "lifetime"
        ) {
          //TODO
        }

        res
          .status(200)
          .json({ error: false, message: "Plan changed successfully" });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message || "Something went wrong",
        };
        return res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/customer/subscription/:id",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * cancel subscription
         */
        const { id } = req.params;
        const { cancel_type } = req.body;
        const user_id = req.user_id;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_subscription");

        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const db = sdk.getDatabase();
        const [sub] = await db.query(
          `select sub.*, price.type as planType from ${sdk.getTable()} as sub left join ${priceTable} as price on sub.price_id = price.id where sub.status != 'canceled' and sub.id = ${+id} and sub.user_id = ${user_id}`
        );

        if (!sub[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Subscription not found" });
        }

        if (sub[0].planType === "lifetime") {
          sdk.setTable("stripe_subscription");
          await sdk.update(
            {
              status: "canceled",
              update_at: sqlDateTimeFormat(new Date()),
            },
            sub[0].id
          );
        } else {
          if (cancel_type == "at_period_end") {
            await stripe.cancelStripeSubscriptionAtPeriodEnd({
              subscriptionId: sub[0].stripe_id,
            });
          } else {
            await stripe.cancelStripeSubscription({
              subscriptionId: sub[0].stripe_id,
            });
          }
        }

        res
          .status(200)
          .json({
            error: false,
            message: "Subscription is canceled successfully",
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * checkout session
   * create
   */
  app.post(
    "/v2/api/lambda/stripe/checkout",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      /**
       * Params: success_url, mode, cancel_url, client_reference_id, customer, customer_email
       *
       */
      sdk.setProjectId(req.projectId);
      const {
        mode,
        success_url,
        cancel_url,
        shipping_address_collection,
        shipping_options,
        payment_method_types,
        payment_intent_data,
        phone_number_collection,
        line_items,
        metadata,
      } = req.body;

      try {
        const validationResult = await ValidationService.validateObject(
          {
            mode: "required",
            success_url: "required",
            cancel_url: "required",
            payment_method_types: "required",
            line_items: "required",
          },
          { mode, success_url, cancel_url, payment_method_types, line_items }
        );
        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }
        const customer_id = req.user_id;
        sdk.setTable("user");
        const customer = await sdk.get({ id: customer_id });
        if (!customer[0]) {
          return res
            .status(404)
            .json({ error: true, message: "Customer not found" });
        }
        if (!customer[0].stripe_uid) {
          return res
            .status(403)
            .json({
              error: true,
              message: "Add a card before trying to subscribe",
            });
        }

        if (mode == "subscription") {
          sdk.setTable("stripe_subscription");
          const customerSubscriptions = await sdk.getStr([
            `user_id = ${+customer[0].id}`,
            `status = 'active' OR status = 'trialing'`,
          ]);
          if (customerSubscriptions.length > 0) {
            return res
              .status(401)
              .json({
                error: true,
                message: "Customer already has an active subscription",
              });
          }
        }

        const stripeCustomer = await stripe.retrieveStripeCustomer({
          customerId: customer[0].stripe_uid,
        });
        if (
          !stripeCustomer.default_source &&
          !stripeCustomer.sources?.data?.length
        ) {
          return res
            .status(403)
            .json({
              error: true,
              message:
                "You don't have a valid card attached, please add one and try again",
            });
        }

        let params = {
          mode,
          success_url,
          cancel_url,
          customer: customer[0].stripe_uid,
          payment_method_types,
          shipping_address_collection,
          shipping_options,
          payment_intent_data,
          line_items,
          metadata: {
            ...metadata,
            projectId: sdk.getProjectId(),
          },
          phone_number_collection,
        };

        const checkout = await stripe.createCheckoutSession(params);

        sdk.setTable("stripe_checkout");
        await sdk.insert({
          user_id: customer[0].id,
          stripe_id: checkout.id,
          object: JSON.stringify(checkout),
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        res.status(200).json({
          error: false,
          model: checkout,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message || "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * stripe customer
   * get
   * get invoices
   * get orders
   * create
   * delete
   */
  app.get(
    "/v2/api/lambda/stripe/customer",
    middlewares,
    TokenMiddleware({ role: "admin|user" }),
    async function (req, res) {
      try {
        /**
         * get customer
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "User ID missing" }],
          });
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");
        const userData = await sdk.get({ id: req.query.id });
        if (!userData.length) {
          res.status(404).json({ error: true, message: "User not found" });
        }
        if (!userData[0].stripe_uid) {
          return res.status(404).json({
            error: true,
            message: "Stripe ID not found",
            validation: [{ id: "Stripe ID not found" }],
          });
        }
        await stripe.retrieveStripeCustomer({
          customerId: userData[0].stripe_uid,
        });
        // retrieve customer data from stripe to ensure it is still exists
        res.status(200).json({ error: false, model: userData[0] });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/customer/invoices",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * get card
         */
        const { after = null, before = null, limit = 10 } = req.query;
        const id = req.user_id;

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");

        const user = await sdk.get({ id: id });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }
        const customer_stripe_id = user[0].stripe_uid;
        const invoices = await stripe.retrieveCustomerInvoices({
          customerId: customer_stripe_id,
          after,
          before,
          limit,
        });

        res.status(200).json({
          error: false,
          list: invoices,
          limit: limit,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  app.get(
    "/v2/api/lambda/stripe/customer/orders",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        const { limit, page } = req.query;
        const id = req.user_id;

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");

        const user = await sdk.get({ id: id });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }

        const db = sdk.getDatabase();
        const ordersTable = `${sdk.getProjectId()}_stripe_order`;
        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const userTable = `${sdk.getProjectId()}_user`;

        const where = [`o.user_id = ${id}`];
        /**
         * get all orders of that user id join it with user and price to get details
         */
        let sqlQuery = `
              SELECT 
                ${jsonExtractor("o.object", "amount")} as amount,
                ${jsonExtractor("o.object", "status")} as status,
                ${jsonExtractor("o.object", "currency")} as currency,
                ${jsonExtractor("o.object", "created")} as created_at,
                ${jsonExtractor("p.object", "nickname")} as product_name,
                u.email as customer
              from ${ordersTable} as o
              LEFT JOIN ${userTable} as u ON o.user_id = u.id
              LEFT JOIN ${priceTable} as p ON o.price_id = p.id
              WHERE ${where.length ? where.join(" AND ") : 1}`;

        if (limit === "all") {
          let [[...resource]] = await db.query(sqlQuery);
          resource.map((row) => (row.object = JSON.parse(row.object)));
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(
          `
              SELECT COUNT(*) as count
              from ${ordersTable} as o
              LEFT JOIN ${userTable} as u ON o.user_id = u.id
              LEFT JOIN ${priceTable} as p ON o.price_id = p.id
              WHERE ${where.length ? where.join(" AND ") : 1}`
        );

        const [[...resource]] = await db.query(
          `${sqlQuery}
              LIMIT ${(+page - 1) * +limit}, ${+limit}
            `
        );

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  app.post(
    "/v2/api/lambda/stripe/customer",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * create customer with card
         */
        const userId = req.user_id;
        const { cardToken } = req.body;
        sdk.setProjectId(req.projectId);

        sdk.table("user");

        const user = await sdk.get({ id: userId });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }

        const metadata = {
          projectId: sdk.getProjectId(),
        };

        const stripeCustomer = await stripe.createStripeCustomer({
          email: user[0].email,
          tokenId: cardToken,
          metadata,
        });

        await sdk.update({ stripe_uid: stripeCustomer.id }, userId);
        const updatedUser = await sdk.get({ id: userId });
        res.status(200).json({
          error: false,
          model: updatedUser[0],
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  app.delete(
    "/v2/api/lambda/stripe/customer",
    middlewares,
    TokenMiddleware({ role: "user" }),
    async function (req, res) {
      try {
        /**
         * delete customer
         */
        const userId = req.user_id;

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");

        const user = sdk.get({ id: userId });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }
        const customer_stripe_id = user[0].stripe_uid;
        await stripe.deleteStripeCustomer({ customerId: customer_stripe_id });

        res
          .status(200)
          .json({ error: false, message: "Customer deleted successfully" });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * subscriptions
   * get one
   * get all
   */
  // subscription
  app.get(
    "/v2/api/lambda/stripe/subscription/:id",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * get subscription
         */
        const { id } = req.params;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_subscription");
        const subscriptions = await sdk.get({ id });
        if (!subscriptions.length) {
          res
            .status(404)
            .json({ error: true, message: "Subscription not found" });
        }
        res.status(200).json({
          error: false,
          model: subscriptions[0],
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/subscriptions",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * get subscriptions
         */
        let {
          limit,
          page,
          user_id,
          customer_email,
          plan_name,
          sub_status,
          plan_type,
          order_by,
          direction,
        } = req.query;

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const subscriptionTable = `${sdk.getProjectId()}_stripe_subscription`;
        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const userTable = `${sdk.getProjectId()}_user`;

        let query = filterEmptyFields({
          user_id,
          customer_email,
          plan_name,
          sub_status,
          plan_type,
        });

        let where = [];
        Object.entries(query)?.forEach(([key, value]) => {
          switch (key) {
            case "user_id": {
              where.push(`sub.user_id = ${+value} `);
              break;
            }
            case "customer_email": {
              where.push(`user.email LIKE '%${value}%' `);
              break;
            }
            case "plan_name": {
              where.push(`price.name LIKE '%${value}%' `);
              break;
            }
            case "sub_status": {
              where.push(`sub.status = '${value}' `);
              break;
            }
            case "plan_type": {
              where.push(`price.type = '${value}' `);
              break;
            }
          }
        });

        let sqlQuery = `
          SELECT sub.id as subId, ${jsonExtractor(
            "sub.object",
            "created"
          )} as createdAt,
            ${jsonExtractor(
              "sub.object",
              "current_period_start"
            )} as currentPeriodStart,            
            ${jsonExtractor(
              "sub.object",
              "current_period_end"
            )} as currentPeriodEnd, sub.status as status,
            price.is_usage_metered as isMetered, price.name as planName, price.type as planType, price.amount as planAmount, price.trial_days as trialDays,
            user.email as userEmail
          from ${subscriptionTable} as sub
          LEFT JOIN ${priceTable} as price ON sub.price_id = price.id
          LEFT JOIN ${userTable} as user ON sub.user_id = user.id
          WHERE ${where.length ? where.join(" AND ") : 1}`;

        if (limit === "all") {
          const [[...resource]] = await db.query(sqlQuery);
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(
          `SELECT COUNT(*) as count from ${subscriptionTable} as sub
          LEFT JOIN ${priceTable} as price ON sub.price_id = price.id        
          LEFT JOIN ${userTable} as user ON sub.user_id = user.id
          WHERE ${where.length ? where.join(" AND ") : 1} `
        );
        const [[...resource]] = await db.query(
          `${sqlQuery}
          LIMIT ${(+page - 1) * +limit}, ${+limit}
          `
        );

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/subscription/:id",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * cancel subscription
         */
        const { id: subscriptionId } = req.params;
        const { cancel_type } = req.body;

        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_subscription");

        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const db = sdk.getDatabase();
        const [sub] = await db.query(
          `select sub.*, price.type as planType from ${sdk.getTable()} as sub left join ${priceTable} as price on sub.price_id = price.id where sub.status != 'canceled' and sub.id = ${+subscriptionId} `
        );

        if (!sub[0]) {
          return res
            .status(404)
            .json({
              error: true,
              message: `Subscription of id ${+subscriptionId} not found`,
            });
        }

        if (sub[0].planType === "lifetime") {
          sdk.setTable("stripe_subscription");
          await sdk.update(
            {
              status: "canceled",
              update_at: sqlDateTimeFormat(new Date()),
            },
            sub[0].id
          );
        } else {
          if (cancel_type == "at_period_end") {
            await stripe.cancelStripeSubscriptionAtPeriodEnd({
              subscriptionId: sub[0].stripe_id,
            });
          } else {
            await stripe.cancelStripeSubscription({
              subscriptionId: sub[0].stripe_id,
            });
          }
        }

        res
          .status(200)
          .json({
            error: false,
            message: "Subscription is canceled successfully",
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * customer cards
   * get one //TODO
   * get all
   * create one
   * set card as default
   * update one //TODO
   * delete one
   */

  app.get(
    "/v2/api/lambda/stripe/customer/cards",
    middlewares,
    TokenMiddleware({ role: "user|customer|client" }),
    async function (req, res) {
      try {
        /**
         * get card
         */
        const { after = null, before = null, limit = 10 } = req.query;
        const id = req.user_id;

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");

        const user = await sdk.get({ id: id });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }
        const customer_stripe_id = user[0].stripe_uid;
        if (!customer_stripe_id)
          return res.status(200).json({
            error: false,
            data: null,
            limit: limit,
          });
        const cards = await stripe.retrieveStripeCustomerAllCards({
          customerId: customer_stripe_id,
          after,
          before,
          limit,
        });

        res.status(200).json({
          error: false,
          data: cards,
          limit: limit,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/customer/card",
    middlewares,
    TokenMiddleware({ role: "user|customer|client" }),
    async function (req, res) {
      try {
        /**
         * update customer
         * body should be {user_id, cardToken}
         * this should create a customer in stripe if doesn't exist and add the card to him
         */
        const userId = req.user_id;
        const { sourceToken } = req.body;

        const validationResult = await ValidationService.validateObject(
          { sourceToken: "required" },
          { sourceToken }
        );
        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");

        const user = await sdk.get({ id: userId });
        if (!user.length) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }

        const customerStripeId = user[0].stripe_uid;
        const metadata = {
          projectId: sdk.getProjectId(),
        };
        if (!customerStripeId) {
          /**
           * create a new customer with the token
           */
          var customer = await stripe.createStripeCustomerWithCard({
            email: user[0].email,
            tokenId: sourceToken,
            metadata,
          });

          await sdk.update({ stripe_uid: customer.id }, user[0].id);
        } else {
          /**
           * just add the card
           */
          var customer = await stripe.addNewCardToStripeCustomer({
            customerId: customerStripeId,
            tokenId: sourceToken,
            metadata,
          });
        }

        res.status(200).json({
          error: false,
          model: customer,
          message: "Customer card added successfully",
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.put(
    "/v2/api/lambda/stripe/customer/card/:id/set-default",
    middlewares,
    TokenMiddleware({ role: "user|customer|client" }),
    async function (req, res) {
      try {
        /**
         * update customer card
         */
        const userId = req.user_id;
        const { id: cardId } = req.params;

        const validationResult = await ValidationService.validateObject(
          { cardId: "required" },
          { cardId }
        );
        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");
        const user = await sdk.get({ id: userId });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }

        if (!user[0].stripe_uid) {
          return res
            .status(404)
            .json({ error: true, message: "User is not a stripe customer" });
        }

        await stripe.setDefaultCard({
          customer_id: user[0].stripe_uid,
          card_id: cardId,
        });
        /**
         * update credit card for customer
         */
        res
          .status(200)
          .json({ error: false, message: "Card successfully set as default" });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/customer/card/:id",
    middlewares,
    TokenMiddleware({ role: "user|customer|client" }),
    async function (req, res) {
      try {
        /**
         * delete customer card
         */
        const userId = req.user_id;
        const { id: cardId } = req.params;

        const validationResult = await ValidationService.validateObject(
          { cardId: "required" },
          { cardId }
        );
        if (validationResult.error) {
          return res.status(400).json(validationResult);
        }

        sdk.setProjectId(req.projectId);
        sdk.setTable("user");
        const user = await sdk.get({ id: userId });
        if (!user[0]) {
          return res
            .status(404)
            .json({ error: true, message: "User not found" });
        }

        if (!user[0].stripe_uid) {
          return res
            .status(404)
            .json({ error: true, message: "User is not a stripe customer" });
        }

        await stripe.deleteStripeCustomerCard({
          customerId: user[0].stripe_uid,
          cardId: cardId,
        });
        res
          .status(200)
          .json({
            error: false,
            message: "Card deleted successfully",
            isDeleted: true,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * invoices
   * get all
   */
  app.get(
    "/v2/api/lambda/stripe/invoices",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * get card
         */
        const { after = null, before = null, limit = 10 } = req.query;

        const invoices = await stripe.retrieveCustomerInvoices({
          after,
          before,
          limit,
        });

        res.status(200).json({
          error: false,
          list: invoices,
          limit: limit,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/invoices-v2",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        const { limit, page, customer_email, status } = req.query;

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const invoicesTable = `${sdk.getProjectId()}_stripe_invoice`;

        const where = [];
        /**
         * get all invoices
         */
        let sqlQuery = `
        SELECT 
          ${jsonExtractor("i.object", "status")} as status,
          ${jsonExtractor("i.object", "currency")} as currency,
          ${jsonExtractor("i.object", "amount_due")} as amount_due,
          ${jsonExtractor("i.object", "amount_paid")} as amount_paid,
          ${jsonExtractor("i.object", "amount_remaining")} as amount_remaining,
          ${jsonExtractor("i.object", "created")} as created_at
        FROM ${invoicesTable} as i
        WHERE ${where.length ? where.join(" AND ") : 1}`;

        if (limit === "all") {
          let [[...resource]] = await db.query(sqlQuery);
          resource.map((row) => (row.object = JSON.parse(row.object)));
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(
          `
        SELECT COUNT(*) as count
        FROM ${invoicesTable} as i
        WHERE ${where.length ? where.join(" AND ") : 1}`
        );

        const [[...resource]] = await db.query(
          `${sqlQuery}
          LIMIT ${(+page - 1) * +limit}, ${+limit}
        `
        );

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  /**
   * orders
   * get all
   */
  app.get(
    "/v2/api/lambda/stripe/orders",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        const { limit, page, customer_email, product_name } = req.query;

        sdk.setProjectId(req.projectId);

        const db = sdk.getDatabase();
        const ordersTable = `${sdk.getProjectId()}_stripe_order`;
        const priceTable = `${sdk.getProjectId()}_stripe_price`;
        const userTable = `${sdk.getProjectId()}_user`;

        let query = filterEmptyFields({
          customer_email,
          product_name,
        });

        let where = [];
        Object.entries(query)?.forEach(([key, value]) => {
          switch (key) {
            case "product_name": {
              where.push(
                `${jsonExtractor("p.object", "nickname")} LIKE '%${value}%'`
              );
              break;
            }
            case "customer_email": {
              where.push(`u.email LIKE '%${value}%' `);
              break;
            }
          }
        });

        let sqlQuery = `
            SELECT u.email as customer,
              ${jsonExtractor("o.object", "amount")} as amount,
              ${jsonExtractor("o.object", "status")} as status,
              ${jsonExtractor("o.object", "currency")} as currency,
              ${jsonExtractor("o.object", "created")} as created_at,
              ${jsonExtractor(
                "p.object",
                "nickname"
              )} as product_name            
            from ${ordersTable} as o
            LEFT JOIN ${userTable} as u ON o.user_id = u.id
            LEFT JOIN ${priceTable} as p ON o.price_id = p.id
            WHERE ${where.length ? where.join(" AND ") : 1}`;

        if (limit === "all") {
          let [[...resource]] = await db.query(sqlQuery);
          resource.map((row) => (row.object = JSON.parse(row.object)));
          return res.status(200).json({ error: false, list: resource });
        }

        const [[{ count: total }]] = await db.query(`
        SELECT COUNT(*) as count
        from ${ordersTable} as o
        LEFT JOIN ${userTable} as u ON o.user_id = u.id
        LEFT JOIN ${priceTable} as p ON o.price_id = p.id
        WHERE ${where.length ? where.join(" AND ") : 1}
      `);

        const [[...resource]] = await db.query(
          `${sqlQuery}
            LIMIT ${(+page - 1) * +limit}, ${+limit}
          `
        );

        const num_pages = Math.ceil(+total / +limit);
        res
          .status(200)
          .json({
            error: false,
            list: resource,
            total,
            limit,
            num_pages,
            page,
          });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * refunds
   * get one    //TO REVIEW
   * get all    //TODO
   * create one //TO REVIEW
   * cancel one //TO REVIEW
   */
  app.get(
    "/v2/api/lambda/stripe/refund",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * get refund
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Refund ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_refund");
        const refundData = await sdk.get({ id: req.query.id });
        if (!refundData.length) {
          res.status(404).json({ error: true, message: "Refund not found" });
        }
        const refund = await stripe.retrieveStripeRefund({
          refund_id: refundData[0].stripe_id,
        });
        res.status(200).json({
          error: false,
          model: refund,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/refund",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * create refund
         */
        if (!req.body.user_id) {
          return res.status(403).json({
            error: true,
            message: "User ID Missing",
            validation: [{ id: "User ID missing" }],
          });
        }
        if (!req.body.amount) {
          return res.status(403).json({
            error: true,
            message: "Amount Missing",
            validation: [{ id: "Amount missing" }],
          });
        }
        if (!req.body.reason) {
          return res.status(403).json({
            error: true,
            message: "Reason Missing",
            validation: [{ id: "Reason missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_customer");
        const customerData = await sdk.get({ id: req.body.user_id });
        if (!customerData.length) {
          res.status(404).json({ error: true, message: "Customer not found" });
        }
        const refund = await stripe.createStripeRefund({
          customer_stripe_id: customerData[0].stripe_id,
          user_id: req.body.user_id,
          charge_id: req.body.charge_id,
          amount: req.body.amount,
          reason: req.body.reason,
        });
        // capture refund on webhook
        res.status(200).json({
          error: false,
          model: refund,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/refund",
    middlewares,
    TokenMiddleware({ role: "admin" }),
    async function (req, res) {
      try {
        /**
         * delete/cancel refund
         */
        if (!req.body.user_id) {
          return res.status(403).json({
            error: true,
            message: "User ID Missing",
            validation: [{ id: "User ID missing" }],
          });
        }
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Refund ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_refund");
        const refundData = await sdk.get({ id: req.query.id });
        if (!refundData.length) {
          res.status(404).json({ error: true, message: "Refund not found" });
        }
        const refund = await stripe.cancelStripeRefund({
          refund_id: refundData[0].stripe_id,
        });
        await sdk.update({ status: 0 }, req.query.id);
        res.status(200).json({
          error: false,
          model: refund,
          message: "Refund cancelled",
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * disputes
   * get one      //TO REVIEW
   * get all      //TO REVIEW
   * create one   //TO REVIEW
   * update one   //TO REVIEW
   * submit one   //TO REVIEW
   * cancel one   //TO REVIEW
   */
  app.get(
    "/v2/api/lambda/stripe/dispute",
    middlewares,
    async function (req, res) {
      try {
        /**
         * get dispute from DB
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Dispute ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_dispute");
        const disputeData = await sdk.get({ id: req.query.id });
        if (!disputeData.length) {
          res.status(404).json({ error: true, message: "Dispute not found" });
        }
        const dispute = await stripe.retrieveStripeDispute({
          dispute_id: disputeData[0].stripe_id,
        });
        res.status(200).json({
          error: false,
          model: dispute,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.get(
    "/v2/api/lambda/stripe/disputes",
    middlewares,
    async function (req, res) {
      try {
        /**
         * get dispute list from DB
         */
        if (!req.body.user_id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "User ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_dispute");
        const disputes = await sdk.get({ user_id: req.body.user_id });
        if (!disputes.length) {
          res.status(404).json({ error: true, message: "Dispute not found" });
        }
        res.status(200).json({
          error: false,
          list: disputes,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/dispute",
    middlewares,
    async function (req, res) {
      try {
        /**
         * create dispute on stripe
         */
        if (!req.body.user_id) {
          return res.status(403).json({
            error: true,
            message: "User ID Missing",
            validation: [{ id: "User ID missing" }],
          });
        }
        if (!req.body.reason) {
          return res.status(403).json({
            error: true,
            message: "Reason Missing",
            validation: [{ id: "Reason missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_customer");
        const customerData = await sdk.get({ id: req.body.user_id });
        if (!customerData.length) {
          res.status(404).json({ error: true, message: "Customer not found" });
        }
        const dispute = await stripe.createStripeDispute({
          charge_id: req.body.charge_id,
          reason: req.body.reason,
          reason_description: req.body.reason_description,
        });
        // capture dispute on webhook
        res.status(200).json({
          error: false,
          model: dispute,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.put(
    "/v2/api/lambda/stripe/dispute",
    middlewares,
    async function (req, res) {
      try {
        /**
         * submit dispute on stripe
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Dispute ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_dispute");
        const disputeData = await sdk.get({ id: req.query.id });
        if (!disputeData.length) {
          res.status(404).json({ error: true, message: "Dispute not found" });
        }
        const dispute = await stripe.updateStripeDispute({
          dispute_id: disputeData[0].stripe_id,
          reason: req.body.reason,
          reason_description: req.body.reason_description,
        });
        res.status(200).json({
          error: false,
          model: dispute,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.post(
    "/v2/api/lambda/stripe/dispute/submit",
    middlewares,
    async function (req, res) {
      try {
        /**
         * submit dispute on stripe
         */
        if (!req.body.dispute_id) {
          return res.status(403).json({
            error: true,
            message: "Dispute ID Missing",
            validation: [{ id: "Dispute ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_dispute");
        const disputeData = await sdk.get({ id: req.body.dispute_id });
        if (!disputeData.length) {
          res.status(404).json({ error: true, message: "Dispute not found" });
        }
        const dispute = await stripe.submitStripeDispute({
          dispute_id: req.body.dispute_id,
        });
        res.status(200).json({
          error: false,
          model: dispute,
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );
  app.delete(
    "/v2/api/lambda/stripe/dispute",
    middlewares,
    async function (req, res) {
      try {
        /**
         * delete dispute on stripe
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Dispute ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_dispute");
        const disputeData = await sdk.get({ id: req.query.id });
        if (!disputeData.length) {
          res.status(404).json({ error: true, message: "Dispute not found" });
        }
        const dispute = await stripe.closeStripeDispute({
          dispute_id: disputeData[0].stripe_id,
        });
        res.status(200).json({
          error: false,
          model: dispute,
          message: "Dispute closed",
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  /**
   * coupons
   * get
   * get all  //TODO
   * create   //TODO
   * update   //TODO
   * delete   //TODO
   */
  app.get(
    "/v2/api/lambda/stripe/coupon",
    middlewares,
    async function (req, res) {
      try {
        /**
         * get coupon on stripe
         */
        if (!req.query.id) {
          return res.status(403).json({
            error: true,
            message: "ID Missing",
            validation: [{ id: "Coupon ID missing" }],
          });
        }
        sdk.setProjectId(req.projectId);
        sdk.setTable("stripe_payment_coupon");
        const coupon = await sdk.get({ id: req.query.id });
        if (!coupon.length) {
          return res.status(404).json({
            error: true,
            message: "Coupon not found",
          });
        }
        res.json({
          error: false,
          model: coupon[0],
        });
      } catch (err) {
        console.error(err);
        let payload = {
          error: true,
          trace: err,
          message: err.message ?? "Something went wrong",
        };
        res.status(500).json(payload);
      }
    }
  );

  // ? means optional
  // ! required
  // !? required on condition
  const error = {
    message: "Error",
  };
  return [
    //products
    {
      method: "GET",
      name: "Get stripe products",
      url: "/v2/api/lambda/stripe/products",
      paginated: true,
      canGetAll: true,
      query: [
        "limit!:integer|'all'",
        "page!?[limit != 'all']:integer", //page is required if limit doesn't equal 'all'
        "name?:string",
        "stripe_id?:string",
        "status?:integer",
      ],
      params: null,
      body: null,
      successResponse:
        "{ error: false, list:array[], total:integer|undefined, limit:integer|undefined, num_pages:integer|undefined, page:integer|undefined }", //list containing all matching products
      errors: [
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "GET",
      name: "Get single stripe product",
      url: "/v2/api/lambda/stripe/product/:id",
      paginated: false,
      canGetAll: false,
      query: null,
      params: ["id!:integer"],
      body: null,
      successResponse: "{ error: false, model: object{} }", //model containing the product
      errors: [
        {
          status: 404,
          error: true,
          message: "Product not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create a single stripe product",
      url: "/v2/api/lambda/stripe/product",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: ["name!:string, description?:string"],
      successResponse:
        "{ error: false, model: object{}, message: 'Product created successfully' }", //model containing the newly created product
      errors: [
        {
          status: 400,
          error: true,
          message: "Parameter/s missing",
          validation: { name: "Name is required" },
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "PUT",
      name: "Edit a single stripe product",
      url: "/v2/api/lambda/stripe/product/:id",
      paginated: false,
      canGetAll: false,
      query: null,
      params: ["id!:integer"],
      body: ["name?:string", "stripe_id?:string", "status?:integer"],
      successResponse:
        "{ error: false, message: 'Product updated successfully' }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Parameter/s missing",
          validation: { id: "Id is required" },
        },
        {
          status: 404,
          error: true,
          message: "Product not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    //prices
    {
      method: "GET",
      name: "Get stripe prices",
      url: "/v2/api/lambda/stripe/prices",
      paginated: true,
      canGetAll: true,
      query: [
        "limit!:integer|'all'",
        "page!?[limit != 'all']:integer", //page is required if limit doesn't equal 'all'
        "stripe_id?:string",
        "product_name?:string",
        "status?:integer",
        "type?:string",
        "name?:string",
        "amount?:integer",
      ],
      params: null,
      body: null,
      successResponse:
        "{ error: false, list:array[], total:integer|undefined, limit:integer|undefined, num_pages:integer|undefined, page:integer|undefined }", //list containing all matching prices
      errors: [
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "GET",
      name: "Get single stripe price",
      url: "/v2/api/lambda/stripe/price/:id",
      paginated: false,
      canGetAll: false,
      query: null,
      params: ["id!:integer"],
      body: null,
      successResponse: "{ error: false, model: object{} }", //model containing the product
      errors: [
        {
          status: 404,
          error: true,
          message: "Price not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create a single stripe price",
      url: "/v2/api/lambda/stripe/price",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: [
        "product_id!: integer",
        "name!: string",
        "amount!: number",
        "type!: 'recurring'|'one_time'",
        "interval!?[type == 'recurring']: 'day'|'week'|'month'|'year'", //required if type is 'recurring'
        "interval_count!?[interval]: integer", //required if interval selected
        "trial_days?: integer",
        "usage_type!?[interval]: 'licenced'|'metered'", //required if interval selected
        "usage_limit!?[usage_type == 'metered']: integer", //required if usafe type is 'metered'
      ],
      successResponse:
        "{ error: false, model: object{}, message: 'Price created successfully' }", //model containing the newly created product
      errors: [
        {
          status: 400,
          error: true,
          message: "Parameter/s missing",
          validation: {
            product_id: "Product id is required",
            name: "Name is required",
            amount: "Amount is required",
            type: "Type is required",
          },
        },
        {
          status: 404,
          error: true,
          message: "Product not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "PUT",
      name: "Edit a single stripe price",
      url: "/v2/api/lambda/stripe/price/:id",
      paginated: false,
      canGetAll: false,
      query: null,
      params: ["id!:integer"],
      body: ["name?:string", "status?:integer"],
      successResponse:
        "{ error: false, message: 'Price updated successfully' }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Parameter/s missing",
          validation: { id: "Id is required" },
        },
        {
          status: 404,
          error: true,
          message: "Price not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    //customer
    {
      method: "GET",
      name: "Get logged in user stripe subscription",
      url: "/v2/api/lambda/stripe/customer/subscription",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: null,
      successResponse: "{ error: false, customer: object{} }", //customer containing the user object with subscription and plan ids attached
      errors: [
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "GET",
      name: "Get logged in user stripe subscriptions",
      url: "/v2/api/lambda/stripe/customer/subscriptions",
      paginated: true,
      canGetAll: true,
      query: [
        "limit!:integer|'all'",
        "page!?[limit != 'all']:integer", //page is required if limit doesn't equal 'all'
      ],
      params: null,
      body: null,
      successResponse:
        "{ error: false, list:array[], total:integer|undefined, limit:integer|undefined, num_pages:integer|undefined, page:integer|undefined }", //list containing all of logged in user subscriptions
      errors: [
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create a stripe subscription for a logged in user",
      url: "/v2/api/lambda/stripe/customer/subscription",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: ["planId!: integer"],
      successResponse:
        "{ error: false, message: 'User subscribed successfully' }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: { planId: "Plan id is required" },
        },
        {
          status: 404,
          error: true,
          message: "Customer not found",
        },
        {
          status: 404,
          error: true,
          message: "Plan not found",
        },
        {
          status: 401,
          error: true,
          message: "Customer already has an active subscription",
        },
        {
          status: 403,
          error: true,
          message:
            "You don't have a valid card attached, please add one and try again",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create a stripe charge for a usage metered subscription",
      url: "/v2/api/lambda/stripe/subscription/usage-charge",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: ["subId!: string", "quantity!: integer"],
      successResponse:
        "{ error: false, model: object{}, message: 'Charge recorded successfully' }", //model containing the recored charge
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: {
            planId: "Plan id is required",
            quantity: "Quantity is required",
          },
        },
        {
          status: 404,
          error: true,
          message: "Subscription not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Register new user then subscribe",
      url: "/v2/api/lambda/stripe/customer/register-subscribe",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: [
        "planId!: integer",
        "email!: string",
        "password!: string",
        "cardToken!: string",
      ],
      successResponse:
        "{ error: false, model: object{}, message: 'User registered & subscribed successfully', role: 'user', token: string, expire_at: Date, user_id: integer }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: {
            planId: "Plan id is required",
            email: "Email is required",
            password: "Password is required",
            cardToken: "Card token is required",
          },
        },
        {
          status: 403,
          error: true,
          message: "User exists",
        },
        {
          status: 404,
          error: true,
          message: "Subscription not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "PUT",
      name: "Upgrade or downgrade subscription of logged in user",
      url: "/v2/api/lambda/stripe/customer/subscription",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: ["activeSubscriptionId!: integer", "newPlanId!: integer"],
      successResponse: "{ error: false, message: 'Plan changed successfully' }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: {
            planId: "Plan id is required",
            email: "Email is required",
            password: "Password is required",
            cardToken: "Card token is required",
          },
        },
        {
          status: 404,
          error: true,
          message: "Customer not found",
        },
        {
          status: 404,
          error: true,
          message: "Passed subscription id doesn't match the customer record",
        },
        {
          status: 403,
          error: true,
          message:
            "You don't have a valid card attached, please add one and try again",
        },
        {
          status: 404,
          error: true,
          message: "Plan not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "DELETE",
      name: "Cancel subscription of logged in user",
      url: "/v2/api/lambda/stripe/customer/subscription/:id",
      paginated: false,
      canGetAll: false,
      query: null,
      params: ["id!: integer"],
      body: ["cancel_type!: 'at_period_end'|'any'"],
      successResponse:
        "{ error: false, message: 'Subscription is canceled successfully' }",
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: { id: "Id is required" },
        },
        {
          status: 404,
          error: true,
          message: "Subscription not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create checkout session",
      url: "/v2/api/lambda/stripe/checkout",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: [
        "mode!: 'payment'",
        "success_url!: string",
        "cancel_url!: string",
        "payment_method_types!: ['card|...']",
        "payment_intent_data!: object{}", //used to pass custom metadata parameters so we identify the charge and do proper calculation
        "phone_number_collection?: boolean",
        "line_items!: array[]",
        "metadata?: object{}",
        "shipping_address_collection?: object{}",
        "shipping_options",
      ],
      successResponse: "{ error: false, model: object{} }", //model contains checkout object
      errors: [
        {
          status: 400,
          error: true,
          message: "Validation Error",
          validation: {
            mode: "mode is required",
            success_url: "success_url is required",
            cancel_url: "cancel_url is required",
            payment_method_types: "payment_method_types is required",
            payment_intent_data: "payment_intent_data is required",
          },
        },
        {
          status: 401,
          error: true,
          message: "Customer already has an active subscription",
        },
        {
          status: 404,
          error: true,
          message: "Customer not found",
        },
        {
          status: 403,
          error: true,
          message: "Add a card before trying to subscribe",
        },
        {
          status: 403,
          error: true,
          message:
            "You don't have a valid card attached, please add one and try again",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "GET",
      name: "Get logged in customer stripe invoices",
      url: "/v2/api/lambda/stripe/customer/invoices",
      paginated: true, //stripe cursor pagination system
      canGetAll: false,
      query: ["after?: string, before?: string, limit!: integer"],
      params: null,
      body: null,
      successResponse: "{ error: false, list: array[], limit: integer }", //list contains invoices object
      errors: [
        {
          status: 404,
          error: true,
          message: "User not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "GET",
      name: "Get logged in customer stripe orders",
      url: "/v2/api/lambda/stripe/customer/orders",
      paginated: true,
      canGetAll: true,
      query: [
        "limit!:integer|'all'",
        "page!?[limit != 'all']:integer", //page is required if limit doesn't equal 'all'
      ],
      params: null,
      body: null,
      successResponse:
        "{ error: false, list:array[], total:integer|undefined, limit:integer|undefined, num_pages:integer|undefined, page:integer|undefined }", //list containing all orders of logged in user
      errors: [
        {
          status: 404,
          error: true,
          message: "User not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "POST",
      name: "Create stripe profile of an existing and logged in customer with a credit card token",
      url: "/v2/api/lambda/stripe/customer",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: ["cardToken!: string"],
      successResponse: "{ error: false, model: object{} }", //model containing the updated customer object in system
      errors: [
        {
          status: 404,
          error: true,
          message: "User not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
    {
      method: "DELETE",
      name: "Delete customer stripe profile",
      url: "/v2/api/lambda/stripe/customer",
      paginated: false,
      canGetAll: false,
      query: null,
      params: null,
      body: null,
      successResponse:
        "{ error: false, message: 'Customer deleted successfully' }",
      errors: [
        {
          status: 404,
          error: true,
          message: "User not found",
        },
        {
          status: 500,
          error: true,
          message: error.message || "Something went wrong",
          trace: error, //error object for debuging
        },
      ],
    },
  ];
};
