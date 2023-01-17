const geoip = require('geoip-lite');
const { sqlDateFormat, sqlDateTimeFormat } = require('../services/UtilService');
module.exports = async function (req, res, next) {
  let sdk = req.app.get("sdk");
  const referrer = req.headers.referrer || req.headers.referer;
  let country = 'na';

  if (req.ip) {
    const geo = geoip.lookup(req.ip);
    country = geo ? geo.country : "na";
  }

  const payload = {
    user_id: req.user_id ? req.user_id : 0,
    role: req.role ? req.role : 'na',
    url: req.originalUrl,
    path: req.baseUrl + req.path,
    hostname: referrer ? referrer : 'na',
    ip: req.ip ? req.ip : 'na',
    browser: req.headers["user-agent"] ? req.headers["user-agent"] : 'na',
    country: country,
    create_at: sqlDateFormat(new Date()),
    update_at: sqlDateTimeFormat(new Date()),
  };

  try {
    sdk.getDatabase();
    sdk.setProjectId(req.projectId);
    sdk.setTable("analytic_log");
    await sdk.insert(payload);
    next();
  } catch (error) {
    console.log("Analytic Save Error", error.message);
    next();
  }
}