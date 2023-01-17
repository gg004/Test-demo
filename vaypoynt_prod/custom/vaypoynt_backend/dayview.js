/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
 const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
 const UrlMiddleware = require("../../middleware/UrlMiddleware");
 const HostMiddleware = require("../../middleware/HostMiddleware");
 const TokenMiddleware = require("../../middleware/TokenMiddleware");
 const { sqlDateFormat, sqlDateTimeFormat } = require("../../services/UtilService");
 const middlewares = [
    ProjectMiddleware,
    UrlMiddleware,
    HostMiddleware,
    TokenMiddleware()
    // PermissionMiddleware,
    // RateLimitMiddleware,
    // LogMiddleware,
    // UsageMiddleware
    // CheckProjectMiddleware,
    // AnalyticMiddleware,
    // RoleMiddleware
  ];

 module.exports = function (app) {

    app.post("/v3/api/custom/vaypoynt/dayview", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);
        let {date} = req.body
        let {user_id, role} = req
        console.log(user_id)
        sdk.setTable("employee_profile")

        let employee_data = await sdk.get({
            user_id : user_id
        })
        console.log(employee_data)
        let company_id = employee_data[0].company_id
        date = new Date(Date.parse(date))
        date = String(sqlDateFormat(date))
        let result = await sdk.rawQuery(`SELECT vaypoynt_employee_profile.id, vaypoynt_desk_hotelling.floor, vaypoynt_desk_hotelling.desk_number, DATE(vaypoynt_desk_hotelling.start_time) as date, vaypoynt_employee_profile.profile_photo FROM vaypoynt_desk_hotelling INNER JOIN vaypoynt_employee_profile ON vaypoynt_desk_hotelling.user_id = vaypoynt_employee_profile.user_id WHERE vaypoynt_desk_hotelling.company_id=${company_id} and DATE(vaypoynt_desk_hotelling.start_time)= '${date}'`)
        
        return res.status(200).json({error: false, list: result})
        
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