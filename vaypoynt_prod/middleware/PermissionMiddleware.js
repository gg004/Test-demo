const permissionService = require("../services/PermissionService");

module.exports = async function (req, res, next) {
  console.log("Permission Middleware");

  let originalUrl = req.originalUrl;
  let sdk = req.app.get("sdk");
  sdk.getDatabase();
  sdk.setProjectId(req.projectId);

  const service = new permissionService(sdk, req.projectId, req.header);
  let validate = await service.validate(originalUrl);
  if (validate.error) {
    return res.status(401).json({ message: validate.message });
  }
  next();
};
