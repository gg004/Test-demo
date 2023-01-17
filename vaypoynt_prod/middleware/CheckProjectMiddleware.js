const config = require("../config");

module.exports = function (req, res, next) {
  if (!req.headers['x-project']) {
    res.status(401).send('{"error": true, "code": 401, "message": "Project ID missing"}');
  }

  const raw = req.headers['x-project'];
  const projectId = config.projectId;
  const projectSecret = config.projectId;
  //TODO On production build should check for this
  try {
    const base64DecodeBuffer = new Buffer.from(raw, 'base64');
    let base64Decode = base64DecodeBuffer.toString('ascii');

    if (base64Decode.indexOf(':') < 0) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Format" });
    }

    const parts = base64Decode.split(':');

    if (parts.length != 2) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }

    if (req.hostname.indexOf(projectId) < 0) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }

    if (parts[0] !== projectId) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }

    if (parts[1] !== projectSecret) {
      res.status(401).json({ error: true, code: 401, message: "Project ID Invalid Sections" });
    }

    req.projectId = parts[0];
    req.projectSecret = parts[1];
    next();

  } catch (error) {
    // console.log(error);
    res.status(401).json({ error: true, code: 401, message: "Project ID Invalid" });
  }
}