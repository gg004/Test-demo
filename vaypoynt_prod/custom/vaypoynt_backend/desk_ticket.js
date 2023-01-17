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

   app.get("/v2/api/custom/vaypoynt/company/desktickets/active", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

        let {user_id} = req
        
        let employee_data = await sdk.rawQuery(`SELECT vaypoynt_company_profile.user_id as user_id FROM vaypoynt_employee_profile INNER JOIN vaypoynt_company_profile ON vaypoynt_employee_profile.company_id = vaypoynt_company_profile.id WHERE vaypoynt_employee_profile.user_id = ${user_id}`)
        
        
        
        let desk_tickets = await sdk.rawQuery(`SELECT * FROM vaypoynt_desk_ticket WHERE user_id = ${employee_data[0].user_id} and status = 1`)


        return res.status(200).json({error: false, list: desk_tickets });
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });


    app.get("/v2/api/custom/vaypoynt/company/desktickets", middlewares, async function (req, res) {
        try {
          
          let sdk = req.app.get('sdk');
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);
  
          let {user_id} = req
          
          
          let desk_tickets = await sdk.rawQuery(`SELECT * FROM vaypoynt_desk_ticket WHERE user_id = ${user_id}`)
  
  
          return res.status(200).json({error: false, list: desk_tickets });
        } catch (err) {
          console.error(err);
          res.status(404);
          res.json({
            error: true,
            message: err.message,
          });
        }
      });

      app.post("/v2/api/custom/vaypoynt/company/desktickets/POST", middlewares, async function (req, res) {
        try {
          let sdk = req.app.get("sdk");
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);
          sdk.setTable("desk_ticket");
          let { user_id, role } = req;
          let { floor, section, start, end, status } = req.body;

          if (role != "company") {
            return res.status(403).json({ error: true, message: "Access Denied" });
          }
          if (!floor) {
            return res.status(403).json({
              error: true,
              message: "Floor Missing",
              validation: [{ field: "floor", message: "Floor missing" }]
            });
          }
          if (!section) {
            return res.status(403).json({
              error: true,
              message: "Section Missing",
              validation: [{ field: "section", message: "Section missing" }]
            });
          }
          if (!start) {
            return res.status(403).json({
              error: true,
              message: "Start Missing",
              validation: [{ field: "start", message: "Start missing" }]
            });
          }
          if (!end) {
            return res.status(403).json({
              error: true,
              message: "End Missing",
              validation: [{ field: "end", message: "End missing" }]
            });
          }
          if (!status) {
            return res.status(403).json({
              error: true,
              message: "Status Missing",
              validation: [{ field: "status", message: "Status missing" }]
            });
          }

          let info = {
            create_at: sqlDateFormat(new Date()),
            update_at: sqlDateTimeFormat(new Date()),
            user_id: user_id,
            floor: floor,
            section: section,
            start: start,
            end: end,
            status: status
          };

          let result = await sdk.insert(info);

          return res.status(200).json({ error: false, message: result });
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