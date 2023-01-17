const config = require("../config");
const { allowLambda } = require("../services/UtilService");

module.exports = function (options) {
  return async function (req, res, next) {
    if (config.env == "development") {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("permission");
      const permission = await sdk.get({
        role: req.role,
      });
    } else {
      const permission = require("../permission");
    }

    const acl = JSON.parse(permission[0].permission);
    if (allowLambda(acl, req.originalUrl)) {
      next();
    } else {
      return res.status(403).json({
        error: true,
        message: "Invalid Resource",
      });
    }
  };
};
