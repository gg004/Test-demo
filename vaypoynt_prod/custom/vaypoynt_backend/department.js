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

    app.get("/v2/api/custom/vaypoynt/company/departments", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

         
        let {user_id, role} = req
        
        let departments =[]
        if(role=="company") {
          sdk.setTable("company_profile")
          let company_data = await sdk.get({
            user_id : user_id
          })
    
          // let company_id = company_data[0].id

          
          departments = await sdk.rawQuery(`SELECT vaypoynt_department.id as id, vaypoynt_department.name as name, 
          COUNT(vaypoynt_employee_profile.id) as members from vaypoynt_department Left JOIN vaypoynt_employee_profile 
          ON vaypoynt_department.id = vaypoynt_employee_profile.department_id 
          WHERE vaypoynt_department.company_id = ${company_data[0].id} GROUP BY id`)
        } else { 
          sdk.setTable("employee_profile")
          let employee_data = await sdk.get({
            user_id : user_id
          })
    
          let company_id = employee_data[0].company_id

          
          departments = await sdk.rawQuery(`SELECT vaypoynt_department.id as id, vaypoynt_department.name as name, 
          COUNT(vaypoynt_employee_profile.id) as members from vaypoynt_department Left JOIN vaypoynt_employee_profile 
          ON vaypoynt_department.id = vaypoynt_employee_profile.department_id 
          WHERE vaypoynt_department.company_id = ${company_id} GROUP BY id`)
        }
        


        return res.status(200).json({error: false, list: departments });
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });


    app.post("/v2/api/custom/vaypoynt/company/departments/DELETE", middlewares, async function (req, res) {
        try {
          
          let sdk = req.app.get('sdk');
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);

          let {user_id} = req
          let {id} = req.body
          sdk.setTable("department")
          for(let i of id){
            await sdk.delete({},i)
          }

          return res.status(200).json({error: false, message: "deleted" });
        } catch (err) {
          console.error(err);
          res.status(404);
          res.json({
            error: true,
            message: err.message,
          });
        }
      });

      app.post("/v2/api/custom/vaypoynt/company/departments/POST", middlewares, async function (req, res) {
        try {
          
          let sdk = req.app.get('sdk');
          sdk.getDatabase();
          sdk.setProjectId(req.projectId);

          let {user_id, role} = req
          let {name} = req.body
          if(role != "company"){
             return res.status(403).json({ error: true, message: "Access Denied" });
          } 
          sdk.setTable("company_profile")
          let company_data = await sdk.get({
            user_id
          })
          let info = {
            create_at: sqlDateFormat(new Date()),
            update_at: sqlDateTimeFormat(new Date()),
            name: name,
            company_id: company_data[0].id
          }
          sdk.setTable("department")
          let result = await sdk.insert(info)

          return res.status(200).json({error: false, message: result });
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