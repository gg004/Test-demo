/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
const UrlMiddleware = require("../../middleware/UrlMiddleware");
const HostMiddleware = require("../../middleware/HostMiddleware");
const UploadService = require("../../services/UploadService");
const uploadS3 = UploadService.s3_upload();
const ValidationService = require("../../services/ValidationService");
const JwtService = require("../../services/JwtService");
const StripeService = require("../../services/StripeService");
const { sqlDateFormat, sqlDateTimeFormat, sizeOfRemote } = require("../../services/UtilService");
const imageMiddlewaresS3 = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  uploadS3.single("file"),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

const AuthService= require('../../services/AuthService')
let BackendSDK = require('../../core/BackendSDK');
let config = require('../../config');
let sdk = new BackendSDK()
const stripe = new StripeService();

module.exports = function (app) {

    app.post("/v3/api/custom/vaypoynt/company/register", imageMiddlewaresS3, async function (req, res) {
      try {

        sdk.setDatabase(config);
        sdk.setProjectId("vaypoynt");

        const role = "company";
      const { planId, first_name, last_name, email, password, cardToken, company_name, address } = req.body;
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
      
      const whitelist = ["image/png", "image/jpeg", "image/jpg"];

      if (!whitelist.includes(req.file.mimetype)) {
        return res.status(403).json({ error: true, message: "Invalid Image" });
      }

      sdk.setTable("stripe_price");
      const plan = await sdk.get({ id: planId });
      if (!plan[0]) {
        return res.status(404).json({
          error: true,
          message: "Plan not found",
        });
      }

      const service = new AuthService();
      const result = await service.register(sdk, sdk.getProjectId(), email, password, role, verify = 1);
      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result,
        });
      }
      const metadata = {
        projectId: sdk.getProjectId(),
      };

      const customer = await stripe.createStripeCustomerWithCard({ email, tokenId: cardToken, metadata });
      sdk.setTable("user");
      await sdk.update({ stripe_uid: customer.id }, result);

      await stripe.createStripeSubscription({
        customerId: customer.id,
        priceId: plan[0].stripe_id,
        default_payment_method: customer.default_source,
        trial_from_plan: true,
        metadata,
      });

      const url = req.file.location

      let params = {
        url: url,
        user_id: result,
        caption: null,
        type: 1,
        width: 0,
        height: 0,
      };

      if (whitelist.includes(req.file.mimetype)) {
        const dimensions = await sizeOfRemote(url);
        params.width = dimensions.width;
        params.height = dimensions.height;
        params.type = 0;
      }  

      sdk.setTable("photo");

      const logo_url = await sdk.insert({
        url: params.url,
        caption: params.caption,
        user_id: result,
        width: params.width,
        height: params.height,
        type: params.type,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
      });
      sdk.setTable("company_profile")
      let info = {
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        first_name: first_name,
        last_name: last_name,
        company_name: company_name,
        user_id: result,
        email: email,
        company_logo: params.url,
        address: address
      }
      

      await sdk.insert(info)
      
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
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

  }