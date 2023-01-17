const config = require("./../config");
module.exports = async function (req, res, next) {
  console.log("Host URL:", req.hostname);
  //Write into or check projectID
  if (!req.headers["x-project"] && !req.query["x-project"]) {
    console.log("inside error 1");
    return res.status(401).json({ error: true, code: 401, message: "Project ID missing" });
  }

  const raw = req.headers["x-project"] || req.query["x-project"];

  try {
    const base64DecodeBuffer = new Buffer.from(raw, "base64");
    let base64Decode = base64DecodeBuffer.toString("ascii");

    if (base64Decode.indexOf(":") < 0) {
      return res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Format" });
    }

    const parts = base64Decode.split(":");

    if (parts.length != 2) {
      return res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }

    if (config.env == "production") {
      result = require("../project");

      if (result.secret != parts[1]) {
        return res.status(401).json({ error: true, code: 401, message: "Invalid Secret" });
      }
    } else {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId("manaknight");
      sdk.setTable("projects");

      const result = await sdk.get({ project_id: parts[0] });

      if (result.length == 0) {
        return res.status(401).json({ error: true, code: 401, message: "Project ID Not Found" });
      }

      if (result[0].secret != parts[1]) {
        return res.status(401).json({ error: true, code: 401, message: "Invalid Secret" });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: true, code: 401, message: "Project ID Invalid" });
  }
};
