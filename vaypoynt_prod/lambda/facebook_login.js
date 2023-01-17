const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");
const permissionService = require("../services/PermissionService");
const DevLogService = require("../services/DevLogService");
const config = require("../config");
const queryString = require("query-string");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  PermissionMiddleware
  // LambdaPermissionMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  // url = https://graph.facebook.com/v4.0/oauth/access_token
  // params = client_id, client_secret, code, redirect_uri
  app.get("/v2/api/lambda/facebook/code", [UrlMiddleware], async function (req, res) {
    try {
      const parts = req.query.state.split("~");
      const base64DecodeBuffer = new Buffer.from(parts[0], "base64");
      let base64Decode = base64DecodeBuffer.toString("ascii").split(":");
      const projectId = base64Decode[0];
      const role = parts[1];
      let service = new AuthService();

      // Note: Checking for permission as we can't use PermissionMiddleware here
      const sdk = app.get("sdk");
      let originalUrl = req.originalUrl;

      sdk.getDatabase();
      sdk.setProjectId(projectId);
      const svc = new permissionService(sdk, projectId, req.header);
      let validate = await svc.validate(originalUrl);
      if (validate.error) {
        return res.status(401).json({ message: validate.message });
      }

      // Remark: Fetching Project
      sdk.setProjectId("manaknight");
      sdk.setTable("projects");
      const project = await sdk.get({
        project_id: projectId
      });

      // get access token from facebook
      const facebookAccessTokenCall = await fetch(
        `https://graph.facebook.com/v4.0/oauth/access_token?client_id=${config.facebook.client_id}&client_secret=${config.facebook.client_secret}&code=${req.query.code}&redirect_uri=${config.facebook.callback_uri}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await facebookAccessTokenCall.json();
      logService.log(data);

      if (facebookAccessTokenCall.status !== 200) {
        return res.status(403).json({
          error: true,
          failure: "access token",
          message: "Something went wrong"
        });
      }

      const facebookMeCall = await fetch(`https://graph.facebook.com/v4.0/me?fields=id,email,first_name,last_name&access_token=${data.access_token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const userData = await facebookMeCall.json();
      logService.log(userData);

      if (facebookMeCall.status !== 200) {
        return res.status(403).json({
          error: true,
          failure: "me",
          message: "Something went wrong"
        });
      }
      let id;
      if (parts[2]) {
        const company_id = parts[2];
        sdk.setProjectId(projectId);
        sdk.setTable("company");
        const company = await sdk.get({ id: company_id });
        if (!company) {
          return res.status(404).json({ message: "Company Not found", error: true });
        }
        id = await service.facebookLogin(app.get("sdk"), projectId, userData, data, role, company_id);
      } else {
        id = await service.facebookLogin(app.get("sdk"), projectId, userData, data, role);
      }

      if (typeof id === "string") {
        return res.status(403).json({
          error: true,
          message: "Something went wrong"
        });
      }

      const resData = JSON.stringify({
        error: false,
        role: role,
        token: JwtService.createAccessToken(
          {
            user_id: id,
            role: role
          },
          config.jwt_expire,
          config.jwt_key
        ),
        expire_at: config.jwt_expire,
        user_id: id
      });

      const encodedURI = encodeURI(resData);

      res.redirect(`https://${project[0].hostname}/login/oauth?data=${encodedURI}`);
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        error: true,
        message: "Invalid Credentials"
      });
    }
  });

  app.get("/v2/api/lambda/facebook/login", middlewares, async function (req, res) {
    if (req.query.role === "admin") return res.status(403).json({ error: true, message: "Can't register admin with this API" });

    const stringifiedParams = queryString.stringify({
      client_id: config.facebook.client_id,
      redirect_uri: config.facebook.callback_uri,
      scope: ["email", "user_friends"].join(","),
      response_type: "code",
      auth_type: "rerequest",
      display: "popup"
    });

    // generate facebookLoginUrl with stringifiedParams and '&state=' + req.headers['x-project'] + '~' + (req.query.role ? req.query.role : 'admin');

    const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}&state=${req.headers["x-project"]}~${req.query.role}~${req.query.company_id}`;
    // console.log(facebookLoginUrl);
    return res.send(facebookLoginUrl);
  });

  return [
    {
      method: "GET",
      name: "Facebook Login API",
      url: "/v2/api/lambda/facebook/lambda",
      successPayload: "['Will redirect to facebook login with auth link']",
      queryBody: [{ key: "role", value: "admin" }],
      needToken: false,
      errors: []
    },
    {
      method: "GET",
      name: "Facebook Code Webhook",
      url: "/v2/api/lambda/facebook/code",
      successPayload: '{"error": false,"role": "admin","qr_code": "qrCode","one_time_token": "token","expire_at": 60,"user_id": 1}',
      queryBody: [{ key: "state", value: "projectId~secret" }],
      needToken: false,
      errors: [
        {
          name: "403",
          query: [{ key: "state", value: "projectId~secret" }],
          response: '{"error": true, "failure": "access token", "message": "Something went wrong"}'
        },
        {
          name: "403",
          query: [{ key: "state", value: "projectId~secret" }],
          response: '{"error": true, "failure": "me", "message": "Something went wrong"}'
        }
      ]
    }
  ];
};
