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
    
  app.get("/v3/api/custom/vaypoynt/statuschart", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if(role == "employee"){
        sdk.setTable("employee_profile")

        let employee_data = await sdk.get({user_id: user_id})
        let departments = await sdk.rawQuery(`SELECT * from vaypoynt_department WHERE id = ${employee_data[0].department_id}`);

        let result = {};
        for (let d of departments) {
          let desk_data = await sdk.rawQuery(
            `SELECT DAY(vaypoynt_desk_hotelling.start_time) as Day, WEEK(vaypoynt_desk_hotelling.start_time) as Week, MONTH(vaypoynt_desk_hotelling.start_time) as Month, vaypoynt_employee_profile.first_name, vaypoynt_employee_profile.last_name, vaypoynt_desk_hotelling.status_type, vaypoynt_desk_hotelling.user_id FROM vaypoynt_desk_hotelling Left JOIN vaypoynt_employee_profile ON vaypoynt_desk_hotelling.user_id = vaypoynt_employee_profile.user_id WHERE vaypoynt_desk_hotelling.company_id = ${d.company_id} and vaypoynt_desk_hotelling.department_id = ${d.id} and MONTH(vaypoynt_desk_hotelling.start_time) = MONTH(CURDATE()) and YEAR(vaypoynt_desk_hotelling.start_time) = YEAR(CURDATE()) and WEEK(vaypoynt_desk_hotelling.start_time) = WEEK(CURDATE()) GROUP BY Month, Day, vaypoynt_employee_profile.id`
          );
          result[d.name] = desk_data;
        }

        return res.status(200).json({ error: false, list: result });
      }
      sdk.setTable("company_profile");

      let company_data = await sdk.rawQuery(`SELECT * FROM vaypoynt_company_profile WHERE user_id = ${user_id}`);
      let departments = await sdk.rawQuery(`SELECT * from vaypoynt_department WHERE company_id = ${company_data[0].id}`);
      let current_date = new Date();
      current_date = `${current_date.getFullYear()}-${current_date.getMonth() + 1}-${current_date.getDate()}`;

      let result = {};
      for (let d of departments) {
        let desk_data = await sdk.rawQuery(
          `SELECT DAY(vaypoynt_desk_hotelling.start_time) as Day, WEEK(vaypoynt_desk_hotelling.start_time) as Week, MONTH(vaypoynt_desk_hotelling.start_time) as Month, vaypoynt_employee_profile.first_name, vaypoynt_employee_profile.last_name, vaypoynt_desk_hotelling.status_type, vaypoynt_desk_hotelling.user_id FROM vaypoynt_desk_hotelling Left JOIN vaypoynt_employee_profile ON vaypoynt_desk_hotelling.user_id = vaypoynt_employee_profile.user_id WHERE vaypoynt_desk_hotelling.company_id = ${d.company_id} and vaypoynt_desk_hotelling.department_id = ${d.id} and MONTH(vaypoynt_desk_hotelling.start_time) = MONTH(CURDATE()) and YEAR(vaypoynt_desk_hotelling.start_time) = YEAR(CURDATE()) and WEEK(vaypoynt_desk_hotelling.start_time) = WEEK(CURDATE()) GROUP BY Month, Day, vaypoynt_employee_profile.id`
        );
        result[d.name] = desk_data;
      }

      return res.status(200).json({ error: false, list: result });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/custom/vaypoynt/statuschart/employee", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id } = req;
      let { day, month, year, status_type } = req.body;

      let selected_date = `${year}-${month}-${day}`;

      sdk.setTable("employee_profile");

      let employee_data = await sdk.get({
        user_id: user_id
      });

      let result = await sdk.rawQuery(
        `SELECT vaypoynt_employee_profile.first_name as first_name, vaypoynt_employee_profile.last_name as last_name FROM vaypoynt_desk_hotelling Left JOIN vaypoynt_employee_profile ON vaypoynt_desk_hotelling.user_id=vaypoynt_employee_profile.user_id WHERE DATE(vaypoynt_desk_hotelling.start_time) = '${selected_date}' and vaypoynt_desk_hotelling.company_id = ${employee_data[0].company_id} and vaypoynt_desk_hotelling.user_id != ${user_id} and vaypoynt_desk_hotelling.status_type = ${status_type}`
      );

      return res.status(200).json({ error: false, list: result });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  }