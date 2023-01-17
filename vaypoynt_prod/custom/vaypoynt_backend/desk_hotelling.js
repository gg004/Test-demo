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

    app.post("/v3/api/custom/vaypoynt/deskhotelling", middlewares, async function (req, res) {
      try {

        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

          sdk.setTable("employee_profile")
        let {user_id} = req
        let employee_data = await sdk.get({
            user_id : user_id
        })

        sdk.setTable("desk_hotelling")

        let info = {
            "create_at": sqlDateFormat(new Date()),
            "update_at": sqlDateTimeFormat(new Date()),
            "floor" : req.body.floor,
            "user_id": user_id,
            "start_time": sqlDateTimeFormat(new Date (Date.parse(req.body.start_time))),
            "end_time": sqlDateTimeFormat(new Date (Date.parse(req.body.end_time))),
            "desk_number": req.body.desk_number,
            "status_type": req.body.status_type,
            "company_id": employee_data[0].company_id,
            "department_id": employee_data[0].department_id
        }
        const desk_hotelling_id = await sdk.insert(info)

        return res.status(200).json({error: false, message: "OK", desk_hotelling_id : desk_hotelling_id });
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });


    app.get("/v3/api/custom/vaypoynt/deskhotelling", middlewares, async function (req, res) {
        try {
  
          let sdk = req.app.get('sdk');
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);
          let {user_id} = req
          sdk.setTable("company_profile")
          let company_data = await sdk.get({user_id: user_id})
          sdk.setTable("desk_hotelling")
          let company_id = company_data[0].id

          let desk_data = await sdk.get({
            company_id: company_id
          })

          return res.status(200).json({error: false, list: desk_data});
        } catch (err) {
          console.error(err);
          res.status(404);
          res.json({
            error: true,
            message: err.message,
          });
        }
      });

      app.get("/v3/api/custom/vaypoynt/deskhotelling/employee", middlewares, async function (req, res) {
        try {
  
          let sdk = req.app.get('sdk');
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);
          let {user_id} = req
    
          sdk.setTable("desk_hotelling")
         

          let desk_data = await sdk.get({
            user_id: user_id
          })

          return res.status(200).json({error: false, list: desk_data});
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