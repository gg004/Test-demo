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

    app.get("/v2/api/custom/vaypoynt/employee", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);
        let {user_id, role} = req
        if(role=="company"){
          sdk.setTable("company_profile")
          let company_data = await sdk.get({
            user_id : user_id
          })
          
          let company_id = company_data[0].id
          
          let employees = await sdk.rawQuery(`SELECT * from vaypoynt_employee_profile WHERE company_id = ${company_id} `)
          return res.status(200).json({error: false, list: employees });
        }
        else{
          sdk.setTable("employee_profile")
          let employee_data = await sdk.get({
            user_id : user_id
          })
          
          let company_id = employee_data[0].company_id
          
          let employees = await sdk.rawQuery(`SELECT * from vaypoynt_employee_profile WHERE company_id = ${company_id} and user_id != ${user_id} `)
  
  
          return res.status(200).json({error: false, list: employees });
        }
        
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });


    app.post("/v2/api/custom/vaypoynt/employee/PUT", middlewares, async function (req, res) {
      try {
        let sdk = req.app.get("sdk");
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

        let { user_id, role } = req;
        if (role != "employee") {
          return res.status(403).json({ error: true, message: "Access Denied" });
        } else {
          sdk.setTable("employee_profile");

          await sdk.updateWhere(req.body, {
            user_id: user_id
          });

          return res.status(200).json({ error: false, message: "Updated" });
        }
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message
        });
      }
    });
    
    app.post("/v2/api/custom/vaypoynt/employee/DELETE", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);
         
        let {user_id, role} = req
        let {id} = req.body
        sdk.setTable("employee_profile")
        for(let i of id){
          await sdk.update({
            company_id: null,
            department_id: null
          }, id)
        }

        return res.status(200).json({error: false, message: "deleted"})
        
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });


    app.post("/v2/api/custom/vaypoynt/employee/assign/department", middlewares, async function (req, res) {
      try {
        
        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);
         
        let {user_id, role} = req
        let {employee_id, department_id} = req.body

        sdk.setTable('company_profile');

        let company_profile = await sdk.get({user_id: user_id});
        console.log(company_profile);
        if(!company_profile.length){
          throw new Error("User doesn't belong to a company")
        }
        sdk.setTable('department');

        let department = await sdk.get({id: department_id});

        if(!department.length){
          throw new Error("Department doesn't exists");
        }

        // console.log(department);

        if(department[0].company_id != company_profile[0].id){
          throw new Error("Department doesn't belong to your company");
        }

        sdk.setTable('employee_profile');
        let employee = await sdk.get({id: employee_id});

        if(!employee.length){
          throw new Error("Employee doesn't exist");
        }

        sdk.setTable('department_pending_assignment');
        
        let depart_requests = await sdk.get({ employee_id: employee_id });
        if (!depart_requests.length < 1) {
          throw new Error("request already sent");
        }
        await sdk.insert({
          company_id: company_profile[0].id, department_id: department[0].id, employee_id: employee_id
        })


        // await sdk.updateWhere({company_id: user_id, department_id: department[0].id}, {user_id: employee_id});

        return res.status(200).json({error: false, message: "Inviation sent successfully"});

        
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

    app.get("/v2/api/custom/vaypoynt/employee/pending-approvals", middlewares, async function (req, res) {
      try {

        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

        

        let {user_id} = req;
        sdk.setTable('employee_profile');
        let employee_profile = await sdk.get({
          user_id: user_id
        })

        sdk.setTable('department_pending_assignment');
        let approvals = await sdk.rawQuery(`SELECT vaypoynt_department_pending_assignment.id as id, vaypoynt_department_pending_assignment.employee_id as employee_id, vaypoynt_department_pending_assignment.company_id as company_id, vaypoynt_department_pending_assignment.department_id as department_id, vaypoynt_department.name as department_name, vaypoynt_company_profile.company_name FROM vaypoynt_department_pending_assignment Left JOIN vaypoynt_department ON vaypoynt_department_pending_assignment.department_id=vaypoynt_department.id Left JOIN vaypoynt_company_profile ON vaypoynt_department_pending_assignment.company_id=vaypoynt_company_profile.id WHERE employee_id = ${employee_profile[0].id}`)

       return res.status(200).json({error: false, list: approvals})
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

    app.get("/v2/api/custom/vaypoynt/employee/approve/:approval_id", middlewares, async function (req, res) {
      try {

        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);

        let {user_id} = req;
        sdk.setTable('employee_profile');
        let employee_profile = await sdk.get({
          user_id: user_id
        })
        sdk.setTable('department_pending_assignment');

       let {approval_id} = req.params;
       let approvals = await sdk.get({employee_id: employee_profile[0].id, id: approval_id});

       if(!approvals.length){
        throw new Error("Request doesn't exist");
       }

       sdk.setTable("employee_profile");


       await sdk.updateWhere({company_id: approvals[0].company_id, department_id: approvals[0].department_id}, {id: approvals[0].employee_id});
       
       sdk.setTable('department_pending_assignment')
       await sdk.deleteWhere({employee_id: employee_profile[0].id, id: approval_id});
       return res.status(200).json({error: false, message: "successfully added"})
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

    app.delete("/v2/api/custom/vaypoynt/employee/reject/:approval_id", middlewares, async function (req, res) {
      try {

        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);


        let {user_id} = req;
        sdk.setTable('employee_profile');
        let employee_profile = await sdk.get({
          user_id: user_id
        })

        sdk.setTable('department_pending_assignment');
       let {approval_id} = req.params;
       let approvals = await sdk.get({employee_id: employee_profile[0].id, id: approval_id});

       if(!approvals.length){
        throw new Error("Request doesn't exist");
       }

       await sdk.deleteWhere({employee_id: employee_profile[0].id, id: approval_id});
       return res.status(200).json({error: false, message: "Successfully Rejected"})
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

    app.post("/v2/api/custom/vaypoynt/employee/notregistered", middlewares, async function (req, res) {
      try {

        let sdk = req.app.get('sdk');
        sdk.getDatabase();
        sdk.setProjectId(req.projectId);


       let employees = await sdk.rawQuery(`SELECT * FROM vaypoynt_employee_profile WHERE company_id IS NULL and department_id IS NULL`)

       return res.status(200).json({error: false, list: employees})
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          error: true,
          message: err.message,
        });
      }
    });

  app.get("/v3/api/custom/vaypoynt/user-details", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;

      let data = [];
      if (role == "employee") {
        data = await sdk.rawQuery(`SELECT * from vaypoynt_employee_profile WHERE user_id = ${user_id}`);
      } else {
        data = await sdk.rawQuery(`SELECT * from vaypoynt_company_profile WHERE user_id = ${user_id}`);
      }

      return res.status(200).json({ error: false, model: data[0] });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v2/api/custom/vaypoynt/employee/teams/request", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (role != "employee") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      } else {
        sdk.setTable("employee_profile");
        let employee_data = await sdk.get({
          user_id: user_id
        });
        if (typeof employee_data == "string") {
          return res.status(403).json({
            error: true,
            message: result
          });
        }
        await sdk.update({teams_status: 0}, employee_data[0].id)
        sdk.setTable("teams_pending_request");

        let info = {
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          company_id: employee_data[0].company_id,
          employee_id: employee_data[0].id,
          employee_name: `${employee_data[0].first_name} ${employee_data[0].last_name}`,
          employee_email: employee_data[0].email
        };

        let result = await sdk.insert(info);

        return res.status(200).json({ error: false, message: "Request sent successfully" });
      }
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v2/api/custom/vaypoynt/employee/teams/request/cancel", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let { user_id, role } = req;
      if (role != "employee") {
        return res.status(403).json({ error: true, message: "Access Denied" });
      } else {
        sdk.setTable("employee_profile");
        let employee_data = await sdk.get({
          user_id: user_id
        });
        if (typeof employee_data == "string") {
          return res.status(403).json({
            error: true,
            message: result
          });
        }
        await sdk.update({ teams_status: null }, employee_data[0].id);

        sdk.setTable("teams_pending_request");

        await sdk.deleteWhere({ employee_id: employee_data[0].id });

        return res.status(200).json({ error: false, message: "request canceled" });
      }
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