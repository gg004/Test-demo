(async () => {
   try {
    const BackendSDK = require("../../core/BackendSDK");
    const config = require("../../config");
    const sdk = new BackendSDK();
    sdk.setDatabase(config);
    sdk.setProjectId("vaypoynt");

    sdk.setTable("cancel_pending_request");
    let requests = await sdk.rawQuery(`SELECT * FROM vaypoynt_cancel_pending_request WHERE create_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`);

    for (let r of requests) {
      sdk.setTable("company_profile");
      let company_data = await sdk.get({ user_id: r.user_id });

      await sdk.deleteWhere({ user_id: r.user_id });

      sdk.setTable("employee_profile");
      await sdk.updateWhere({ company_id: null, department_id: null }, { company_id: company_data[0].id });

      sdk.setTable("department");
      await sdk.deleteWhere({ company_id: company_data[0].id });

      sdk.setTable("desk_ticket");
      await sdk.deleteWhere({ user_id: r.user_id });

      sdk.setTable("desk_hotelling");
      await sdk.deleteWhere({ company_id: company_data[0].id });
      
      sdk.setTable("cancel_pending_request")
      await sdk.deleteWhere({id: r.id})
      

      sdk.setTable("user")
      await sdk.deleteWhere({id: r.user_id})
      console.log(`user id ${r.user_id} deleted`)
    }
    
  } catch (error) {
    console.log(error)
  } 
})();
