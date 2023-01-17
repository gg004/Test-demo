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
  HostMiddleware
  //TokenMiddleware()
  // PermissionMiddleware,
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];
const BackendSDK = require("../../core/BackendSDK");
const config = require("../../config");
const sdk = new BackendSDK();

module.exports = function (app) {
  app.post("/v3/api/custom/vaypoynt/teams/deskhotelling", async function (req, res) {
    try {
      sdk.setDatabase(config);
      sdk.setProjectId("vaypoynt");

      let { teams_id, teams_name, desk, floor, start_time, end_time, status_type } = req.body;
      let employee_data = await sdk.rawQuery(`SELECT * FROM vaypoynt_employee_profile WHERE teams_name='${teams_name}'`);

      if (typeof employee_data == "string") {
        return res.status(200).json({
          error: true,
          message: result
        });
      }
      if (!employee_data.length) {
        return res.status(200).json({ error: true, message: "Please integrate your teams account to vaypoynt" });
      }
      start_time = new Date(Date.parse(start_time));
      //start_time.setHours(start_time.getHours() + 5);

      end_time = new Date(Date.parse(end_time));
      //end_time.setHours(end_time.getHours() + 5);

      let status_list = ["Office", "WFH", "Vacation", "Holiday", "Sick Day", "Meeting"];
      status_type = status_list.indexOf(status_type);

      let desk_tickets = await sdk.rawQuery(
        `SELECT COUNT(vaypoynt_desk_ticket.start) as count_start, vaypoynt_desk_ticket.end as end FROM vaypoynt_desk_ticket Left JOIN vaypoynt_company_profile ON vaypoynt_desk_ticket.user_id=vaypoynt_company_profile.user_id WHERE vaypoynt_company_profile.id=${employee_data[0].company_id} and floor=${floor} and status=1 and ${desk} BETWEEN vaypoynt_desk_ticket.start AND vaypoynt_desk_ticket.end`
      );
      if (desk_tickets[0].count_start < 1) {
        return res.status(200).json({ error: true, message: "Desk or Floor not available" });
      }
      let r = await sdk.rawQuery(
        `SELECT COUNT(*) as count_desk_hotelling FROM vaypoynt_desk_hotelling WHERE company_id=${employee_data[0].company_id} and department_id=${
          employee_data[0].department_id
        } and desk_number=${desk} and '${sqlDateTimeFormat(start_time)}' BETWEEN start_time AND end_time`
      );

      if (r[0].count_desk_hotelling > 0) {
        return res.status(200).json({ error: true, message: "Desk not available on this timing" });
      }
      sdk.setTable("desk_hotelling");
      let info = {
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        floor: floor,
        user_id: employee_data[0].user_id,
        start_time: sqlDateTimeFormat(start_time),
        end_time: sqlDateTimeFormat(end_time),
        desk_number: desk,
        status_type: status_type,
        company_id: employee_data[0].company_id,
        department_id: employee_data[0].department_id
      };

      let desk_hotelling_id = await sdk.insert(info);

      return res.status(200).json({ error: false, message: "Your booking is scheduled." });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/custom/vaypoynt/teams/deskhotelling/other", async function (req, res) {
    try {
      sdk.setDatabase(config);
      sdk.setProjectId("vaypoynt");

      let { teams_id, teams_name, start_time, end_time, status_type } = req.body;
      let employee_data = await sdk.rawQuery(`SELECT * FROM vaypoynt_employee_profile WHERE teams_id='${teams_id}'`);
      if (typeof employee_data == "string") {
        return res.status(200).json({
          error: true,
          message: result
        });
      }
      if (!employee_data.length) {
        return res.status(200).json({ error: true, message: "Please integrate your teams account to vaypoynt" });
      }
      start_time = new Date(Date.parse(start_time));
      //start_time.setHours(start_time.getHours() + 5);

      end_time = new Date(Date.parse(end_time));
      //end_time.setHours(end_time.getHours() + 5);

      let status_list = ["Office", "WFH", "Vacation", "Holiday", "Sick Day", "Meeting"];
      status_type = status_list.indexOf(status_type);

      sdk.setTable("desk_hotelling");
      let info = {
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        floor: null,
        user_id: employee_data[0].user_id,
        start_time: sqlDateTimeFormat(start_time),
        end_time: sqlDateTimeFormat(end_time),
        desk_number: null,
        status_type: status_type,
        company_id: employee_data[0].company_id,
        department_id: employee_data[0].department_id
      };

      let desk_hotelling_id = await sdk.insert(info);

      return res.status(200).json({ error: false, message: "Your booking is scheduled." });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
};
