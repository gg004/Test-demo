module.exports = function (req, res, next) {
  if (req.query["x-project"]) {
    req.headers["x-project"] = req.query["x-project"];
  }

  if (!req.headers["x-project"]) {
    return res.status(401).json({ error: true, code: 401, message: "Project ID missing" });
  }

  const raw = req.headers["x-project"];

  try {
    const base64DecodeBuffer = new Buffer.from(raw, "base64");
    let base64Decode = base64DecodeBuffer.toString("ascii");

    if (base64Decode.indexOf(":") < 0) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Format" });
    }

    const parts = base64Decode.split(":");

    // console.log("***", parts);

    if (parts.length != 2) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }
    
    req.projectId = parts[0];
    req.projectSecret = parts[1];
    console.log(req.projectId, req.projectSecret);
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: true, code: 401, message: "Project ID Invalid" });
    next();
  }
};
