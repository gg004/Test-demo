const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const PermissionMiddleware = require("../middleware/PermissionMiddleware");
const permissionService = require("../services/PermissionService");
const DevLogService = require("../services/DevLogService");
const config = require("../config");
const NodeGoogleLogin = require("node-google-login");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  PermissionMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

let logService = new DevLogService();

module.exports = function (app) {
  app.get("/v2/api/lambda/google/code", [UrlMiddleware], async function (req, res) {
    try {
      const parts = req.query.state.split("~");
      const base64DecodeBuffer = new Buffer.from(parts[0], "base64");
      let base64Decode = base64DecodeBuffer.toString("ascii").split(":");
      const projectId = base64Decode[0];
      const role = parts[1];

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

      sdk.setProjectId("manaknight");
      sdk.setTable("projects");
      const project = await sdk.get({
        project_id: projectId
      });

      const googleConfig = {
        clientID: config.google.client_id,
        clientSecret: config.google.client_secret,
        redirectURL: config.google.redirect_url,
        defaultScope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
      };

      const googleLogin = new NodeGoogleLogin(googleConfig);

      const userProfile = await googleLogin.getUserProfile(req.query.code);
      let service = new AuthService();
      logService.log(userProfile);
      //verify if that user belongs to that company
      // check if parts has third item
      let id;
      if (parts[2]) {
        const company_id = parts[2];
        sdk.setProjectId(projectId);
        sdk.setTable("company");
        const company = await sdk.get({ id: company_id });
        if (!company) {
          return res.status(404).json({ message: "Company Not found", error: true });
        }
        id = await service.googleLogin(req.app.get("sdk"), projectId, userProfile.user, userProfile.tokens, role, company_id);
      } else {
        id = await service.googleLogin(req.app.get("sdk"), projectId, userProfile.user, userProfile.tokens, role);
      }

      const data = JSON.stringify({
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

      const encodedURI = encodeURI(data);

      res.redirect(`https://${project[0].hostname}/login/oauth?data=${encodedURI}`);
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        error: true,
        message: "Invalid Credentials"
      });
    }
  });

  app.get("/v2/api/lambda/google/code/mobile", middlewares, async function (req, res) {
    //You have to add these userinfo.email,
    // userinfo.profile in the content screen through google console to be abble to use this endpoint.
    // It will require serverAuthcode from the Android/ IOS app, which we simply call code in backend.
    // For IOS/Android dev pass the server client id from config file, and the clientId will be
    // the ones generated for their app.

    const projectId = req.projectId;
    const role = req.query.role ?? "user";
    const googleConfig = {
      clientID: config.google.client_id,
      clientSecret: config.google.client_secret,
      redirectURL: config.google.redirect_url,
      defaultScope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
    };

    const googleLogin = new NodeGoogleLogin(googleConfig);

    try {
      const userProfile = await googleLogin.getUserProfile(req.query.code);
      let service = new AuthService();
      logService.log(userProfile);

      let id;
      if (parts[2]) {
        const company_id = parts[2];
        sdk.setProjectId(projectId);
        sdk.setTable("company");
        const company = await sdk.get({ id: company_id });
        if (!company) {
          return res.status(404).json({ message: "Company Not found", error: true });
        }
        id = await service.googleLogin(req.app.get("sdk"), projectId, userProfile.user, userProfile.tokens, role, company_id);
      } else {
        id = await service.googleLogin(req.app.get("sdk"), projectId, userProfile.user, userProfile.tokens, role);
      }

      return res.status(200).json({
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
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        error: true,
        message: "Invalid Credentials"
      });
    }
  });

  app.get("/v2/api/lambda/google/login", middlewares, async function (req, res) {
    if (req.query.role === "admin") return res.status(403).json({ error: true, message: "Can't register admin with this API" });

    const googleConfig = {
      clientID: config.google.client_id,
      clientSecret: config.google.client_secret,
      redirectURL: config.google.redirect_url,
      defaultScope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
    };
    const googleLogin = new NodeGoogleLogin(googleConfig);

    const authURL = googleLogin.generateAuthUrl() + "&state=" + req.headers["x-project"] + "~" + req.query.role + "~" + req.query.company_id;
    logService.log(authURL);

    return res.send(authURL);
  });

  return [
    {
      method: "GET",
      name: "Google Code API",
      url: "/v2/api/lambda/google/code",
      successPayload: "{error: false, role: 'admin', token: 'jwt token', expire_at: 60, user_id: 1}",
      queryBody: [{ code: "role", state: "projectId~secret" }],
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
    },
    {
      method: "GET",
      name: "Google Login API",
      url: "/v2/api/lambda/google/login",
      successPayload: "['Will redirect to google login with auth link']",
      queryBody: [{ key: "role", value: "admin" }],
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
