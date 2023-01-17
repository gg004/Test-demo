const config = require("../config");
const fs = require("fs");

module.exports = class PostmanService {
  constructor() {}

  createJson(models, permissions, base64ProjectId) {
    // new model structure
    // [
    //   {
    //      "table_name": {
    //                            "column_names": [
    //                              "id",
    //                              "name",
    //                              "email",
    //                            ],
    //                            "data_types": [
    //                              "int",
    //                              "text",
    //                              "text",
    //                            ]
    //                        },
    //   },
    // ]

    let newModelStructure = [];

    // loop through all the models

    for (let i = 0; i < models.length; i++) {
      let tableName = models[i].table_name;

      let columnNames = [];
      let dataTypes = [];

      // if tableName matches with the next table name
      // then push the column name and data type to the array
      // else create a new object with the table name and push the column name and data type to the array

      if (i + 1 < models.length) {
        if (models[i + 1].table_name === tableName) {
          columnNames.push(models[i].column_name);
          dataTypes.push(models[i].data_type);
        } else {
          newModelStructure.push({
            [tableName]: {
              column_names: columnNames,
              data_types: dataTypes,
            },
          });
        }
      }
    }

    // newModelStructure
    // [
    //   { manaknight_projects: { column_names: [], data_types: [] } },
    //   { manaknight_chat: { column_names: [], data_types: [] } },
    //   { manaknight_events: { column_names: [], data_types: [] } },
    //   { manaknight_trigger_type: { column_names: [], data_types: [] } },
    //   { manaknight_user: { column_names: [], data_types: [] } },
    //   { manaknight_trigger_rules: { column_names: [], data_types: [] } },
    //   { manaknight_profile: { column_names: [], data_types: [] } },
    //   { manaknight_token: { column_names: [], data_types: [] } },
    //   { manaknight_photo: { column_names: [], data_types: [] } },
    //   { manaknight_permission: { column_names: [], data_types: [] } },
    //   { manaknight_room: { column_names: [], data_types: [] } },
    //   { manaknight_cms: { column_names: [], data_types: [] } }
    // ]

    // if newModelStructure key matches with the table name of models
    // then push all the column names and data types to the newModelStructure
    // else create a new object with the table name and push all the column names and data types to the newModelStructure

    for (let i = 0; i < newModelStructure.length; i++) {
      let tableName = Object.keys(newModelStructure[i])[0];

      for (let j = 0; j < models.length; j++) {
        if (tableName === models[j].table_name) {
          newModelStructure[i][tableName].column_names.push(models[j].column_name);
          newModelStructure[i][tableName].data_types.push(models[j].data_type);
        }
      }
    }

    for (let i = 0; i < permissions.length; i++) {
      permissions[i].permission = permissions[i].permission.replace(/\r?\n|\r/g, "");
      permissions[i].permission = permissions[i].permission.replace(/\\/g, "");
      permissions[i].permission = JSON.parse(permissions[i].permission);
    }

    let permissionModels = [];

    let allGetRequest = [];
    let allPostRequest = [];
    let allPutRequest = [];
    let allDeleteRequest = [];

    for (let i = 0; i < permissions.length; i++) {
      let permission = permissions[i].permission;
      // console.log('check');
      // console.log(permission);
      console.log(permission.models);

      // push all permission.models to permissionModels array
      for (let j = 0; j < Object.keys(permission.models).length; j++) {
        let modelName = Object.keys(permission.models)[j];

        let columnNamesX = [];
        let dataTypesX = [];

        for (let k = 0; k < newModelStructure.length; k++) {
          let tableName = Object.keys(newModelStructure[k])[0];

          columnNamesX = newModelStructure[k][tableName]["column_names"];
          dataTypesX = newModelStructure[k][tableName]["data_types"];

          // console.log('check for data')
          // console.log(newModelStructure[k][tableName]);
          // console.log(columnNamesX);
          // console.log(dataTypesX);

          if (tableName.includes(modelName)) {
            let get = permission.models[modelName].GET;
            let post = permission.models[modelName].POST;
            let put = permission.models[modelName].PUT;
            let delete_ = permission.models[modelName].DELETE;
            let export_ = permission.models[modelName].EXPORT;
            let autocomplete = permission.models[modelName].AUTOCOMPLETE;
            let import_ = permission.models[modelName].IMPORT;
            let getall = permission.models[modelName].GETALL;

            console.log(get);
            if (get) {
              console.log("get");
              console.log(tableName + "_get");
              // console.log(columnNamesX);
              // console.log(dataTypesX);

              let getRequest = this.sampleGET();
              getRequest.name = tableName + "_get"; // change later on
              getRequest.request = {
                method: "GET",
                header: [
                  {
                    key: "x-project",
                    value: base64ProjectId,
                    type: "text",
                  },
                ],
                body: {
                  mode: "raw",
                  raw: "",
                  options: {
                    raw: {
                      language: "json",
                    },
                  },
                },
                url: {
                  raw: `${config.app_url}/${tableName}`,
                  protocol: "http",
                  host: [config.app_url],
                  port: "3048",
                  path: ["v1", "api", tableName],
                },
              };
              // merge name and request to getRequest
              getRequest = Object.assign(getRequest, { name: tableName + "_get", request: getRequest.request });
              // merge getRequest to allGetRequest
              allGetRequest.push(getRequest);
            }

            if (post) {
              console.log("post");
              console.log(tableName + "_post");
              // console.log(columnNamesX);
              // console.log(dataTypesX);

              let bodyRawJson = {};
              // bodyRawJson key will be column name and value will be "test"
              for (let k = 0; k < columnNamesX.length; k++) {
                bodyRawJson[columnNamesX[k]] = "test";
              }

              let postRequest = this.samplePOST();
              postRequest.name = tableName + "_post"; // change later on
              postRequest.request = {
                method: "POST",
                header: [
                  {
                    key: "x-project",
                    value: base64ProjectId,
                    type: "text",
                  },
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify(bodyRawJson),
                  options: {
                    raw: {
                      language: "json",
                    },
                  },
                },
                url: {
                  raw: `${config.app_url}/${tableName}`,
                  protocol: "http",
                  host: [config.app_url],
                  port: "3048",
                  path: ["v1", "api", tableName],
                },
              };
              // merge name and request to postRequest
              postRequest = Object.assign(postRequest, { name: tableName + "_post", request: postRequest.request });
              // merge postRequest to allPostRequest
              allPostRequest.push(postRequest);
            }

            if (put) {
              console.log("put");
              console.log(tableName + "_put");
              // console.log(columnNamesX);
              // console.log(dataTypesX);

              let bodyRawJson = {};
              // bodyRawJson key will be column name and value will be "test"
              for (let k = 0; k < columnNamesX.length; k++) {
                bodyRawJson[columnNamesX[k]] = "test";
              }

              let putRequest = this.samplePUT();
              putRequest.name = tableName + "_put"; // change later on
              putRequest.request = {
                method: "PUT",
                header: [
                  {
                    key: "x-project",
                    value: base64ProjectId,
                    type: "text",
                  },
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify(bodyRawJson),
                  options: {
                    raw: {
                      language: "json",
                    },
                  },
                },
                url: {
                  raw: `${config.app_url}/${tableName}`,
                  protocol: "http",
                  host: [config.app_url],
                  port: "3048",
                  path: ["v1", "api", tableName],
                },
              };
              // merge name and request to putRequest
              putRequest = Object.assign(putRequest, { name: tableName + "_put", request: putRequest.request });
              // merge putRequest to allPutRequest
              allPutRequest.push(putRequest);
            }

            if (delete_) {
              console.log("delete");
              console.log(tableName + "_del");
              // console.log(columnNamesX);
              // console.log(dataTypesX);

              let deleteRequest = this.sampleDELETE();

              deleteRequest.name = tableName + "_del"; // change later on
              deleteRequest.request = {
                method: "DELETE",
                header: [
                  {
                    key: "x-project",
                    value: base64ProjectId,
                    type: "text",
                  },
                ],
                body: {
                  mode: "raw",
                  raw: "",
                  options: {
                    raw: {
                      language: "json",
                    },
                  },
                },
                url: {
                  raw: `${config.app_url}/${tableName}`,
                  protocol: "http",
                  host: [config.app_url],
                  port: "3048",
                  path: ["v1", "api", tableName],
                },
              };
              // merge name and request to deleteRequest
              deleteRequest = Object.assign(deleteRequest, { name: tableName + "_del", request: deleteRequest.request });
              // merge deleteRequest to allDeleteRequest
              allDeleteRequest.push(deleteRequest);
            }

            // if (export_) {

            // }

            // read all files inside lambda folder
          }

          // console.log(tableName);
        }
      }
    }

    let skeleton = {};
    skeleton = this.skeleton();

    skeleton.item = [...allGetRequest, ...allPostRequest, ...allPutRequest, ...allDeleteRequest];

    // 1: 2fa login
    let twoFaReqBodyList1 = ["email", "password", "role"];
    let bodyRawJson1 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < twoFaReqBodyList1.length; k++) {
      bodyRawJson1[twoFaReqBodyList1[k]] = "test";
    }

    let payload1 = {
      url: `${config.app_url}/v2/api/lambda/2fa/login`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson1),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "2fa", "login"],
    }
    let twoFaPostRequest1 = this.generatePOST(payload1);


    // 2: 2fa auth
    let twoFaReqBodyList2 = ["code", "token"];
    let bodyRawJson2 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < twoFaReqBodyList2.length; k++) {
      bodyRawJson2[twoFaReqBodyList2[k]] = "test";
    }

    let payload2 = {
      url: `${config.app_url}/v2/api/lambda/2fa/auth`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson2),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "2fa", "auth"],
    }
    let twoFaPostRequest2 = this.generatePOST(payload2);


    // 3: check
    let checkReqBodyList = ["role"];
    let bodyRawJson3 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < checkReqBodyList.length; k++) {
      bodyRawJson3[checkReqBodyList[k]] = "test";
    }

    let payload3 = {
      url: `${config.app_url}/v2/api/lambda/check`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson3),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "check"],
    }
    let checkPostRequest = this.generatePOST(payload3);


    // 4: cms
    let cmsReqBodyList1 = ["page", "key", "type", "value"];
    let bodyRawJson4 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < cmsReqBodyList1.length; k++) {
      bodyRawJson4[cmsReqBodyList1[k]] = "test";
    }

    let payload4 = {
      url: `${config.app_url}/v2/api/lambda/cms`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson4),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms"],
    }
    let cmsPostRequest1 = this.generatePOST(payload4);


    // 5: cms put
    let cmsReqBodyList2 = ["page", "key", "type", "value"];
    let bodyRawJson5 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < cmsReqBodyList2.length; k++) {
      bodyRawJson5[cmsReqBodyList2[k]] = "test";
    }

    let payload5 = {
      url: `${config.app_url}/v2/api/lambda/cms/:id`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson5),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", ":id"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsPostRequest2 = this.generatePUT(payload5);


    // 6: cms delete
    let payload6 = {
      url: `${config.app_url}/v2/api/lambda/cms/:id`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", ":id"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsPostRequest3 = this.generateDELETE(payload6);


    // 7: cms get
    let payload7 = {
      url: `${config.app_url}/v2/api/lambda/cms/:id`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", ":id"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsGetRequest1 = this.generateGET(payload7);


    // 8: cms get by page key
    let payload8 = {
      url: `${config.app_url}/v2/api/lambda/cms/:page/:key`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", ":page", ":key"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsGetRequest2 = this.generateGET(payload8);


    // 9: cms get by page
    let payload9 = {
      url: `${config.app_url}/v2/api/lambda/cms/:page`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", ":page"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsGetRequest3 = this.generateGET(payload9);


    // 10: cms get all
    let payload10 = {
      url: `${config.app_url}/v2/api/lambda/cms/all`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "cms", "all"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let cmsGetRequest4 = this.generateGET(payload10);


    // 11: email check
    let payload11 = {
      url: `${config.app_url}/v2/api/lambda/email/check`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "email", "check"],
      query: [
        {
          "key": "email",
          "value": "john@doe.com",
          "disabled": false
        }
      ]
    }
    let emailCheckGetRequest = this.generateGET(payload11);

    // 12: refresh_token post
    let checkReqBodyList2 = ["refresh_token"];
    let bodyRawJson6 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < checkReqBodyList2.length; k++) {
      bodyRawJson6[checkReqBodyList2[k]] = "test";
    }

    let payload12 = {
      url: `${config.app_url}/v2/api/lambda/refresh_token`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson6),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "refresh_token"],
    }
    let refreshTokenPostRequest1 = this.generatePOST(payload12);


    // 13: facebook code get
    let payload13 = {
      url: `${config.app_url}/v2/api/lambda/facebook/code`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "facebook", "code"]
    }
    let facebookLoginGetRequest1 = this.generateGET(payload13);


    // 14: facebook login get
    let payload14 = {
      url: `${config.app_url}/v2/api/lambda/facebook/login`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "facebook", "login"]
    }
    let facebookLoginGetRequest2 = this.generateGET(payload14);


    // 15: video room post
    let payload15 = {
      url: `${config.app_url}/v2/api/lambda/video/room`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "video", "room"],
    }
    let videoRoomPostRequest1 = this.generatePOST(payload15);


    // 16: video token post
    let checkReqBodyList3 = ["room", "identity"];
    let bodyRawJson7 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < checkReqBodyList3.length; k++) {
      bodyRawJson7[checkReqBodyList3[k]] = "test";
    }

    let payload16 = {
      url: `${config.app_url}/v2/api/lambda/video/token`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson7),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "video", "token"],
    }
    let videoRoomPostRequest2 = this.generatePOST(payload16);


    // 17: video room get by id
    let payload17 = {
      url: `${config.app_url}/v2/api/lambda/video/room/:id`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "video", "room", ":id"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let videoRoomGetRequest1 = this.generateGET(payload17);


    // 18: video room get close by id
    let payload18 = {
      url: `${config.app_url}/v2/api/lambda/video/room/:id/close`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "video", "room", ":id", "close"],
      query: [
        {
          "key": "id",
          "value": 1,
          "disabled": false
        }
      ]
    }
    let videoRoomGetRequest2 = this.generateGET(payload18);


    // 19: forgot post
    let forgotReqBodyList = ["email"];
    let bodyRawJson8 = {};
    // bodyRawJson key will be column name and value will be "
    for (let k = 0; k < forgotReqBodyList.length; k++) {
      bodyRawJson8[forgotReqBodyList[k]] = "test";
    }

    let payload19 = {
      url: `${config.app_url}/v2/api/lambda/forgot`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson8),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "forgot"],
    }
    let forgotPostRequest = this.generatePOST(payload19);


    // 20: google code get
    let payload20 = {
      url: `${config.app_url}/v2/api/lambda/google/code`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "google", "code"]
    }
    let googleLoginGetRequest1 = this.generateGET(payload20);


    // 21: google login get
    let payload21 = {
      url: `${config.app_url}/v2/api/lambda/google/login`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "google", "login"]
    }
    let googleLoginGetRequest2 = this.generateGET(payload21);


    // 22: health get
    let payload22 = {
      url: `${config.app_url}/v2/api/lambda/health`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "health"]
    }
    let healthGetRequest = this.generateGET(payload22);


    // 23: login POST
    let loginReqBodyList = ["email", "password", "role"];
    let bodyRawJson9 = {};
    // bodyRawJson key will be column name and value will be "
    for (let k = 0; k < loginReqBodyList.length; k++) {
      bodyRawJson9[loginReqBodyList[k]] = "test";
    }

    let payload23 = {
      url: `${config.app_url}/v2/api/lambda/login`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson9),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "login"],
    }
    let loginPostRequest = this.generatePOST(payload23);


    // 24: preference get
    let preferenceReqBodyList = ["user_id", "preference"];
    let bodyRawJson10 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < preferenceReqBodyList.length; k++) {
      bodyRawJson10[preferenceReqBodyList[k]] = "test";
    }

    let payload24 = {
      url: `${config.app_url}/v2/api/lambda/preference`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson10),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "preference"]
    }
    let preferenceGetRequest = this.generateGET(payload24);


    // 25: profile get
    let payload25 = {
      url: `${config.app_url}/v2/api/lambda/profile`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "profile"]
    }
    let profileGetRequest = this.generateGET(payload25);


    // 26: realtime get 1
    let payload26 = {
      url: `${config.app_url}/v2/api/lambda/room/poll`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "room", "poll"],
      query: [
        {
          "key": "room",
          "value": "test",
          "disabled": false
        }
      ]
    }
    let realtimeGetRequest1 = this.generateGET(payload26);


    // 27: realtime POST 1
    let realtimeReqBodyList2 = ["room_id", "chat_id", "user_id", "message", "date"];
    let bodyRawJson11 = {};
    // bodyRawJson key will be column name and value will be "
    for (let k = 0; k < realtimeReqBodyList2.length; k++) {
      bodyRawJson11[realtimeReqBodyList2[k]] = "test";
    }

    let payload27 = {
      url: `${config.app_url}/v2/api/lambda/send`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson11),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "send"],
    }
    let realtimePostRequest1 = this.generatePOST(payload27);


    // 28: realtime get 2
    let payload28 = {
      url: `${config.app_url}/v2/api/lambda/online`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "online"],
      query: [
        {
          "key": "room_id",
          "value": "test",
          "disabled": false
        },
        {
          "key": "online_user_id",
          "value": "test",
          "disabled": false
        }
      ]
    }
    let realtimeGetRequest2 = this.generateGET(payload28);


    // 29: realtime POST 2
    let realtimeReqBodyList4 = ["room_id", "chat_id", "date"];
    let bodyRawJson12 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < realtimeReqBodyList4.length; k++) {
      bodyRawJson12[realtimeReqBodyList4[k]] = "test";
    }

    let payload29 = {
      url: `${config.app_url}/v2/api/lambda/chat`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson12),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "chat"],
    }
    let realtimePostRequest2 = this.generatePOST(payload29);


    // 30: realtime get 3
    let payload30 = {
      url: `${config.app_url}/v2/api/lambda/room`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "room"],
      query: [
        {
          "key": "room_id",
          "value": "test",
          "disabled": false
        }
      ]
    }
    let realtimeGetRequest3 = this.generateGET(payload30);


    // 31: realtime POST 3
    let realtimeReqBodyList6 = ["user_id"];
    let bodyRawJson13 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < realtimeReqBodyList6.length; k++) {
      bodyRawJson13[realtimeReqBodyList6[k]] = "test";
    }

    let payload31 = {
      url: `${config.app_url}/v2/api/lambda/room`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson13),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "room"],
    }
    let realtimePostRequest3 = this.generatePOST(payload31);


    // 32: register post
    let registerReqBodyList1 = ["email", "password", "role"];
    let bodyRawJson14 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < registerReqBodyList1.length; k++) {
      bodyRawJson14[registerReqBodyList1[k]] = "test";
    }

    let payload32 = {
      url: `${config.app_url}/v2/api/lambda/register`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson14),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "register"],
    }
    let registerPostRequest1 = this.generatePOST(payload32);


    // 33: reset post
    let resetReqBodyList1 = ["token", "code", "password"];
    let bodyRawJson15 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < resetReqBodyList1.length; k++) {
      bodyRawJson15[resetReqBodyList1[k]] = "test";
    }

    let payload33 = {
      url: `${config.app_url}/v2/api/lambda/reset`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson15),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "reset"],
    }
    let resetPostRequest1 = this.generatePOST(payload33);


    // 34: send_mail post
    let sendMailReqBodyList1 = ["to", "from", "subject", "body"];
    let bodyRawJson16 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < sendMailReqBodyList1.length; k++) {
      bodyRawJson16[sendMailReqBodyList1[k]] = "test";
    }

    let payload34 = {
      url: `${config.app_url}/v2/api/lambda/send`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson16),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "send"],
    }
    let sendMailPostRequest1 = this.generatePOST(payload34);


    // 35: update_email post 1
    let updateEmailReqBodyList1 = ["email"];
    let bodyRawJson17 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < updateEmailReqBodyList1.length; k++) {
      bodyRawJson17[updateEmailReqBodyList1[k]] = "test";
    }

    let payload35 = {
      url: `${config.app_url}/v2/api/lambda/update/email`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson17),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "update", "email"],
    }
    let updateEmailPostRequest1 = this.generatePOST(payload35);


    // 36: update_email post 2
    let updateEmailReqBodyList2 = ["id", "email"];
    let bodyRawJson18 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < updateEmailReqBodyList2.length; k++) {
      bodyRawJson18[updateEmailReqBodyList2[k]] = "test";
    }

    let payload36 = {
      url: `${config.app_url}/v2/api/lambda/update/email`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson18),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "update", "email"],
    }
    let updateEmailPostRequest2 = this.generatePOST(payload36);


    // 37: update_password post 1
    let updatePasswordReqBodyList1 = ["password"];
    let bodyRawJson19 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < updatePasswordReqBodyList1.length; k++) {
      bodyRawJson19[updatePasswordReqBodyList1[k]] = "test";
    }

    let payload37 = {
      url: `${config.app_url}/v2/api/lambda/update/password`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson19),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "update", "password"],
    }
    let updatePasswordPostRequest1 = this.generatePOST(payload37);


    // 38: update_password post 1
    let updatePasswordReqBodyList2 = ["id", "password"];
    let bodyRawJson20 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < updatePasswordReqBodyList2.length; k++) {
      bodyRawJson20[updatePasswordReqBodyList2[k]] = "test";
    }

    let payload38 = {
      url: `${config.app_url}/v2/api/lambda/update/password`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson20),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "update", "password"],
    }
    let updatePasswordPostRequest2 = this.generatePOST(payload38);


    // 39: upload post 1
    let uploadApiUrl1 = "/v2/api/lambda/upload";
    let uploadFormData = ["file"];
    let bodyRawJson34 = {};

    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < uploadFormData.length; k++) {
      bodyRawJson34[uploadFormData[k]] = "test";
    }

    let uploadPostRequest1 = this.samplePOST();

    uploadPostRequest1.name = "upload";
    uploadPostRequest1.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "formdata",
        formdata: [
          {
            key: "file",
            type: "file",
            src: "test",
          },
          {
            key: "caption",
            value: "caption",
            type: "text",
          },
        ],
      },
      url: {
        raw: `${config.app_url}${uploadApiUrl1}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "uploads"],
      },
    };
    // merge name and request to uploadPostRequest1
    uploadPostRequest1 = Object.assign(uploadPostRequest1, { name: "upload", request: uploadPostRequest1.request });


    // 40: upload post 2
    let uploadApiUrl2 = "/v2/api/lambda/uploads/only";
    let uploadFormData2 = ["file"];
    let bodyRawJson35 = {};

    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < uploadFormData2.length; k++) {
      bodyRawJson35[uploadFormData2[k]] = "test";
    }

    let uploadPostRequest2 = this.samplePOST();

    uploadPostRequest2.name = "upload";
    uploadPostRequest2.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "formdata",
        formdata: [
          {
            key: "file",
            type: "file",
            src: "test",
          },
        ],
      },
      url: {
        raw: `${config.app_url}${uploadApiUrl2}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "uploads", "only"],
      },
    };
    // merge name and request to uploadPostRequest2
    uploadPostRequest2 = Object.assign(uploadPostRequest2, { name: "upload", request: uploadPostRequest2.request });


    // 41: upload post 3
    let uploadApiUrl3 = "/v2/api/lambda/uploads";
    let uploadFormData3 = ["file"];
    let bodyRawJson36 = {};

    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < uploadFormData3.length; k++) {
      bodyRawJson36[uploadFormData3[k]] = "test";
    }

    let uploadPostRequest3 = this.samplePOST();

    uploadPostRequest3.name = "upload";
    uploadPostRequest3.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "formdata",
        formdata: [
          {
            key: "file",
            type: "file",
            src: "test",
          },
        ],
      },
      url: {
        raw: `${config.app_url}${uploadApiUrl3}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "uploads"],
      },
    };
    // merge name and request to uploadPostRequest3
    uploadPostRequest3 = Object.assign(uploadPostRequest3, { name: "upload", request: uploadPostRequest3.request });


    // 42: subscription channel send post 1
    let subscriptionChannelSendBodyList1 = ["payload", "room"];
    let bodyRawJson21 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < subscriptionChannelSendBodyList1.length; k++) {
      bodyRawJson21[subscriptionChannelSendBodyList1[k]] = "test";
    }

    let payload42 = {
      url: `${config.app_url}/v2/api/lambda/subscription/channel/send`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson21),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "subscription", "channel", "send"],
    }
    let subscriptionChannelPost1 = this.generatePOST(payload42);


    // 43: subscription channel room post 2
    let subscriptionChannelRoomBodyList1 = ["room"];
    let bodyRawJson22 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < subscriptionChannelRoomBodyList1.length; k++) {
      bodyRawJson22[subscriptionChannelRoomBodyList1[k]] = "test";
    }

    let payload43 = {
      url: `${config.app_url}/v2/api/lambda/subscription/channel/room`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson22),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "subscription", "channel", "room"],
    }
    let subscriptionChannelPost2 = this.generatePOST(payload43);


    // 44: subscription channel poll get 1
    let payload44 = {
      url: `${config.app_url}/v2/api/lambda/subscription/channel/poll`,
      base64ProjectId: base64ProjectId,
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "subscription", "channel", "poll"],
      query: [
        {
          "key": "room",
          "value": "test",
          "disabled": false
        }
      ]
    }
    let subscriptionChannelGet1 = this.generateGET(payload44);


    // 45: subscription channel online get 2
    let subscriptionChannelOnlineBodyList1 = ["room"];
    let bodyRawJson23 = {};
    // bodyRawJson key will be column name and value will be "test"
    for (let k = 0; k < subscriptionChannelOnlineBodyList1.length; k++) {
      bodyRawJson23[subscriptionChannelOnlineBodyList1[k]] = "test";
    }

    let payload45 = {
      url: `${config.app_url}/v2/api/lambda/subscription/channel/online`,
      base64ProjectId: base64ProjectId,
      bodyRawJSON: JSON.stringify(bodyRawJson23),
      host: [config.app_url],
      port: "3048",
      urlPath: ["v2", "api", "lambda", "subscription", "channel", "online"]
    }
    let subscriptionChannelGet2 = this.generateGET(payload45);


    let stripeApiUrl1 = "/v2/api/lambda/stripe/product";

    let stripeReqBodyList = [];
    let bodyRawJson37 = {};

    for (let k = 0; k < bodyRawJson37.length; k++) {
      bodyRawJson37[stripeReqBodyList[k]] = "test";
    }

    let stripePostRequest1 = this.samplePOST();
    stripePostRequest1.name = "stripe_product";
    stripePostRequest1.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(bodyRawJson37),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl1}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "product"],
        query: [],
      },
    };
    // merge name and request to stripePostRequest1
    stripePostRequest1 = Object.assign(stripePostRequest1, { name: "stripe_product", request: stripePostRequest1.request });

    let stripeApiUrl2 = "/v2/api/lambda/stripe/product";
    let stripeQueryList1 = ["id"];
    let stripeReqBodyList2 = [];
    let stripeBodyRawJson38 = {};

    for (let k = 0; k < stripeBodyRawJson38.length; k++) {
      stripeBodyRawJson38[stripeReqBodyList2[k]] = "test";
    }

    let stripeGETRequest2 = this.sampleGET();

    stripeGETRequest2.name = "stripe_product";
    stripeGETRequest2.request = {
      method: "GET",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson38),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl2}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "product"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };
    // merge name and request to stripeGETRequest2

    stripeGETRequest2 = Object.assign(stripeGETRequest2, { name: "stripe_product", request: stripeGETRequest2.request });

    let stripeApiUrl3 = "/v2/api/lambda/stripe/price";
    let stripeQueryList2 = ["id"];
    let stripeReqBodyList3 = [];
    let stripeBodyRawJson39 = {};

    for (let k = 0; k < stripeBodyRawJson39.length; k++) {
      stripeBodyRawJson39[stripeReqBodyList3[k]] = "test";
    }

    let stripeGETRequest3 = this.sampleGET();

    stripeGETRequest3.name = "stripe_price";
    stripeGETRequest3.request = {
      method: "GET",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson39),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl3}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "price"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripeGETRequest3 = Object.assign(stripeGETRequest3, { name: "stripe_price", request: stripeGETRequest3.request });

    let stripeApiUrl4 = "/v2/api/lambda/stripe/prices";
    let stripeQueryList3 = ["product_id"];
    let stripeReqBodyList4 = [];
    let stripeBodyRawJson40 = {};

    for (let k = 0; k < stripeBodyRawJson40.length; k++) {
      stripeBodyRawJson40[stripeReqBodyList4[k]] = "test";
    }

    let stripeGETRequest4 = this.sampleGET();

    stripeGETRequest4.name = "stripe_prices";
    stripeGETRequest4.request = {
      method: "GET",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson40),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl4}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "prices"],
        query: [
          {
            key: "product_id",
            value: "test",
          },
        ],
      },
    };

    stripeGETRequest4 = Object.assign(stripeGETRequest4, { name: "stripe_prices", request: stripeGETRequest4.request });

    let stripeApiUrl5 = "/v2/api/lambda/stripe/price";
    let stripeQueryList4 = [];
    let stripeReqBodyList5 = ["product_id", "name", "currency", "amount"];
    let stripeBodyRawJson41 = {};

    for (let k = 0; k < stripeBodyRawJson41.length; k++) {
      stripeBodyRawJson41[stripeReqBodyList5[k]] = "test";
    }

    let stripePOSTRequest5 = this.samplePOST();

    stripePOSTRequest5.name = "stripe_price";

    stripePOSTRequest5.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson41),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl5}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "price"],
        query: [],
      },
    };

    stripePOSTRequest5 = Object.assign(stripePOSTRequest5, { name: "stripe_price", request: stripePOSTRequest5.request });

    let stripeApiUrl6 = "/v2/api/lambda/stripe/price";
    let stripeQueryList5 = ["id"];
    let stripeReqBodyList6 = ["product_id", "name", "currency", "amount"];
    let stripeBodyRawJson42 = {};

    for (let k = 0; k < stripeBodyRawJson42.length; k++) {
      stripeBodyRawJson42[stripeReqBodyList6[k]] = "test";
    }

    let stripePUTRequest6 = this.samplePUT();

    stripePUTRequest6.name = "stripe_price";

    stripePUTRequest6.request = {
      method: "PUT",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson42),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl6}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "price"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripePUTRequest6 = Object.assign(stripePUTRequest6, { name: "stripe_price", request: stripePUTRequest6.request });

    let stripeApiUrl7 = "/v2/api/lambda/stripe/price";
    let stripeQueryList6 = ["id"];
    let stripeReqBodyList7 = [];
    let stripeBodyRawJson43 = {};

    for (let k = 0; k < stripeBodyRawJson43.length; k++) {
      stripeBodyRawJson43[stripeReqBodyList7[k]] = "test";
    }

    let stripeDELETERequest7 = this.sampleDELETE();

    stripeDELETERequest7.name = "stripe_price";

    stripeDELETERequest7.request = {
      method: "DELETE",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson43),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl7}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "price"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripeDELETERequest7 = Object.assign(stripeDELETERequest7, { name: "stripe_price", request: stripeDELETERequest7.request });

    let stripeApiUrl8 = "/v2/api/lambda/stripe/customer";
    let stripeQueryList7 = ["id"];
    let stripeReqBodyList8 = [];
    let stripeBodyRawJson44 = {};

    for (let k = 0; k < stripeBodyRawJson44.length; k++) {
      stripeBodyRawJson44[stripeReqBodyList8[k]] = "test";
    }

    let stripePOSTRequest8 = this.sampleGET();

    stripePOSTRequest8.name = stripeApiUrl8;

    stripePOSTRequest8.request = {
      method: "GET",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson44),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl8}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripePOSTRequest8 = Object.assign(stripePOSTRequest8, { name: "stripe_customer", request: stripePOSTRequest8.request });

    let stripeApiUrl9 = "/v2/api/lambda/stripe/customer";
    let stripeQueryList8 = ["id"];
    let stripeReqBodyList9 = [
      "email",
      "description",
      "name",
      "phone",
      "address_line1",
      "address_line2",
      "address_city",
      "address_state",
      "address_zip",
      "address_country",
    ];
    let stripeBodyRawJson45 = {};

    for (let k = 0; k < stripeBodyRawJson45.length; k++) {
      stripeBodyRawJson45[stripeReqBodyList9[k]] = "test";
    }

    let stripePOSTRequest9 = this.samplePOST();

    stripePOSTRequest9.name = stripeApiUrl9;

    stripePOSTRequest9.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson45),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl9}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripePOSTRequest9 = Object.assign(stripePOSTRequest9, { name: "stripe_customer", request: stripePOSTRequest9.request });

    let stripeApiUrl10 = "/v2/api/lambda/stripe/customer";
    let stripeQueryList9 = [];
    let stripeReqBodyList10 = ["email", "token_id"];
    let stripeBodyRawJson46 = {};

    for (let k = 0; k < stripeBodyRawJson46.length; k++) {
      stripeBodyRawJson46[stripeReqBodyList10[k]] = "test";
    }

    let stripePUTRequest10 = this.samplePOST();

    stripePUTRequest10.name = stripeApiUrl10;

    stripePUTRequest10.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson46),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl10}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer"],
        query: [],
      },
    };

    stripePUTRequest10 = Object.assign(stripePUTRequest10, { name: "stripe_customer", request: stripePUTRequest10.request });

    let stripeApiUrl11 = "/v2/api/lambda/stripe/customer/defaultCard";
    let stripeQueryList10 = ["id"];
    let stripeReqBodyList11 = ["user_id", "card_id"];
    let stripeBodyRawJson47 = {};

    for (let k = 0; k < stripeBodyRawJson47.length; k++) {
      stripeBodyRawJson47[stripeReqBodyList11[k]] = "test";
    }

    let stripePUTRequest11 = this.samplePUT();

    stripePUTRequest11.name = stripeApiUrl11;

    stripePUTRequest11.request = {
      method: "PUT",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson47),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl11}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer", "defaultCard"],
        query: [],
      },
    };

    stripePUTRequest11 = Object.assign(stripePUTRequest11, { name: "stripe_customer_defaultCard", request: stripePUTRequest11.request });

    let stripeApiUrl12 = "/v2/api/lambda/stripe/customer";
    let stripeQueryList11 = ["id"];
    let stripeReqBodyList12 = [];
    let stripeBodyRawJson48 = {};

    for (let k = 0; k < stripeBodyRawJson48.length; k++) {
      stripeBodyRawJson48[stripeReqBodyList12[k]] = "test";
    }

    let stripeDELETERequest12 = this.sampleDELETE();

    stripeDELETERequest12.name = stripeApiUrl12;

    stripeDELETERequest12.request = {
      method: "DELETE",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson48),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl12}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripeDELETERequest12 = Object.assign(stripeDELETERequest12, { name: "stripe_customer", request: stripeDELETERequest12.request });

    let stripeApiUrl13 = "/v2/api/lambda/stripe/customer/cards";
    let stripeQueryList12 = ["id"];
    let stripeReqBodyList13 = [];
    let stripeBodyRawJson49 = {};

    for (let k = 0; k < stripeBodyRawJson49.length; k++) {
      stripeBodyRawJson49[stripeReqBodyList13[k]] = "test";
    }

    let stripeGETRequest13 = this.sampleGET();

    stripeGETRequest13.name = stripeApiUrl13;

    stripeGETRequest13.request = {
      method: "GET",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson49),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl13}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer", "cards"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripeGETRequest13 = Object.assign(stripeGETRequest13, { name: "stripe_customer_cards", request: stripeGETRequest13.request });

    let stripeApiUrl14 = "/v2/api/lambda/stripe/customer/card";
    let stripeQueryList13 = ["id"];
    let stripeReqBodyList14 = ["token_id"];
    let stripeBodyRawJson50 = {};

    for (let k = 0; k < stripeBodyRawJson50.length; k++) {
      stripeBodyRawJson50[stripeReqBodyList14[k]] = "test";
    }

    let stripePOSTRequest14 = this.samplePOST();

    stripePOSTRequest14.name = stripeApiUrl14;

    stripePOSTRequest14.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson50),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl14}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer", "card"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripePOSTRequest14 = Object.assign(stripePOSTRequest14, { name: "stripe_customer_card", request: stripePOSTRequest14.request });

    let stripeApiUrl15 = "/v2/api/lambda/stripe/card";
    let stripeQueryList14 = [];
    let stripeReqBodyList15 = ["card_number", "exp_month", "exp_year", "cvc"];
    let stripeBodyRawJson51 = {};

    for (let k = 0; k < stripeBodyRawJson51.length; k++) {
      stripeBodyRawJson51[stripeReqBodyList15[k]] = "test";
    }

    let stripePOSTRequest15 = this.samplePOST();

    stripePOSTRequest15.name = stripeApiUrl15;

    stripePOSTRequest15.request = {
      method: "POST",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson51),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl15}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "card"],
        query: [],
      },
    };

    stripePOSTRequest15 = Object.assign(stripePOSTRequest15, { name: "stripe_card", request: stripePOSTRequest15.request });

    let stripeApiUrl16 = "/v2/api/lambda/stripe/customer/card";
    let stripeQueryList15 = ["id"];
    let stripeReqBodyList16 = [];
    let stripeBodyRawJson52 = {};

    for (let k = 0; k < stripeBodyRawJson52.length; k++) {
      stripeBodyRawJson52[stripeReqBodyList16[k]] = "test";
    }

    let stripeDELETERequest16 = this.sampleDELETE();

    stripeDELETERequest16.name = stripeApiUrl16;

    stripeDELETERequest16.request = {
      method: "DELETE",
      header: [
        {
          key: "x-project",
          value: base64ProjectId,
          type: "text",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(stripeBodyRawJson52),
      },
      url: {
        raw: `${config.app_url}${stripeApiUrl16}`,
        protocol: "http",
        host: [config.app_url],
        port: "3048",
        path: ["v2", "api", "lambda", "stripe", "customer", "card"],
        query: [
          {
            key: "id",
            value: "test",
          },
        ],
      },
    };

    stripeDELETERequest16 = Object.assign(stripeDELETERequest16, { name: "stripe_customer_card", request: stripeDELETERequest16.request });

    let allLambdaRequests = [];

    allLambdaRequests.push(twoFaPostRequest1);
  
    allLambdaRequests.push(twoFaPostRequest2);
    allLambdaRequests.push(checkPostRequest);
    allLambdaRequests.push(cmsPostRequest1);
    allLambdaRequests.push(cmsPostRequest2);
    allLambdaRequests.push(cmsPostRequest3);
    allLambdaRequests.push(cmsGetRequest1);
    allLambdaRequests.push(cmsGetRequest2);
    allLambdaRequests.push(cmsGetRequest3);
    allLambdaRequests.push(cmsGetRequest4);
    allLambdaRequests.push(emailCheckGetRequest);
    allLambdaRequests.push(refreshTokenPostRequest1);
    allLambdaRequests.push(facebookLoginGetRequest1);
    allLambdaRequests.push(facebookLoginGetRequest2);
    allLambdaRequests.push(videoRoomPostRequest1);
    allLambdaRequests.push(videoRoomPostRequest2);
    allLambdaRequests.push(videoRoomGetRequest1);
    allLambdaRequests.push(videoRoomGetRequest2);
    allLambdaRequests.push(forgotPostRequest);
    allLambdaRequests.push(googleLoginGetRequest1);
    allLambdaRequests.push(googleLoginGetRequest2);
    allLambdaRequests.push(healthGetRequest);
    allLambdaRequests.push(loginPostRequest);
    allLambdaRequests.push(preferenceGetRequest);
    allLambdaRequests.push(profileGetRequest);
    allLambdaRequests.push(realtimePostRequest1);
    allLambdaRequests.push(realtimePostRequest2);
    allLambdaRequests.push(realtimeGetRequest1);
    allLambdaRequests.push(realtimeGetRequest2);
    allLambdaRequests.push(realtimeGetRequest3);
    allLambdaRequests.push(realtimePostRequest3);
    allLambdaRequests.push(registerPostRequest1);
    allLambdaRequests.push(resetPostRequest1);
    allLambdaRequests.push(sendMailPostRequest1);
    allLambdaRequests.push(updateEmailPostRequest1);
    allLambdaRequests.push(updateEmailPostRequest2);
    allLambdaRequests.push(updatePasswordPostRequest1);
    allLambdaRequests.push(updatePasswordPostRequest2);
    allLambdaRequests.push(uploadPostRequest1);
    allLambdaRequests.push(uploadPostRequest2);
    allLambdaRequests.push(uploadPostRequest3);
    allLambdaRequests.push(subscriptionChannelPost1);
    allLambdaRequests.push(subscriptionChannelPost2);
    allLambdaRequests.push(subscriptionChannelGet1);
    allLambdaRequests.push(subscriptionChannelGet2);


    // stripe

    skeleton.item = [...allLambdaRequests];

    // console.log(skeleton);
    // return permissionModels;
    return skeleton;
  }

  sampleGET() {
    return {
      name: "http://localhost:3048/v1/api/validation/rules",
      protocolProfileBehavior: {
        disableBodyPruning: true,
      },
      request: {
        method: "GET",
        header: [
          {
            key: "x-project",
            value: "bWFuYWtuaWdodDo1ZmNoeG41bThoYm82amN4aXEzeGRkb2ZvZG9hY3NreWU=",
            type: "text",
          },
        ],
        body: {
          mode: "raw",
          raw: "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: "http://localhost:3048/v1/api/validation/rules",
          protocol: "http",
          host: ["localhost"],
          port: "3048",
          path: ["v1", "api", "validation", "rules"],
        },
      },
      response: [],
    };
  }

  generateGET(payload) {
    return {
      name: payload.url,
      protocolProfileBehavior: {
        disableBodyPruning: true,
      },
      request: {
        method: "GET",
        header: [
          {
            key: "x-project",
            value: payload.base64ProjectId,
            type: "text",
          },
        ],
        body: {
          mode: "raw",
          raw: payload.bodyRawJSON ?? "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: payload.url,
          protocol: "http",
          host: payload.host,
          port: payload.port,
          path: payload.urlPath,
          query: payload.query ?? [],
        },
      },
      response: [],
    };
  }

  samplePOST() {
    return {
      name: "http://localhost:3048/v1/api/webhook/create_project/cron",
      request: {
        method: "POST",
        header: [
          {
            key: "x-project",
            value: "bWFuYWtuaWdodDpzZWNyZXQ=",
            type: "text",
          },
        ],
        body: {
          mode: "raw",
          raw: '{\n    "name": "sow",\n    "slug": "sow",\n    "host": "sow.mkdlabs.com"\n}',
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: "http://localhost:3048/v1/api/webhook/create_project/cron",
          protocol: "http",
          host: ["localhost"],
          port: "3048",
          path: ["v1", "api", "webhook", "create_project", "cron"],
        },
      },
      response: [],
    };
  }

  generatePOST(payload) {
    return {
      name: payload.url,
      request: {
        method: "POST",
        header: [
          {
            key: "x-project",
            value: payload.base64ProjectId,
            type: "text",
          },
        ],
        body: {
          mode: "raw",
          raw: payload.bodyRawJSON ?? "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: payload.url,
          protocol: "http",
          host: payload.host,
          port: payload.port,
          path: payload.urlPath,
        },
      },
      response: [],
    };
  }

  samplePUT() {
    return {
      name: "New Request",
      request: {
        method: "PUT",
        header: [],
        url: {
          raw: "https://postman-echo.com/put",
          protocol: "https",
          host: ["postman-echo", "com"],
          path: ["put"],
        },
      },
      response: [],
    };
  }

  generatePUT(payload) {
    return {
      name: payload.url,
      request: {
        method: "PUT",
        header: [
          {
            key: "x-project",
            value: payload.base64ProjectId,
            type: "text",
          },
        ],
        body: {
          mode: "raw",
          raw: payload.bodyRawJSON ?? "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: payload.url,
          protocol: "http",
          host: payload.host,
          port: payload.port,
          path: payload.urlPath,
          query: payload.query ?? [],
        },
      },
      response: [],
    };
  }

  sampleDELETE() {
    return {
      name: "New Request",
      request: {
        method: "DELETE",
        header: [],
        url: {
          raw: "https://postman-echo.com/delete",
          protocol: "https",
          host: ["postman-echo", "com"],
          path: ["delete"],
        },
      },
      response: [],
    };
  }

  generateDELETE(payload) {
    return {
      name: "New Request",
      request: {
        method: "DELETE",
        header: [],
        url: {
          raw: payload.url,
          protocol: "http",
          host: payload.host,
          port: payload.port,
          path: payload.urlPath,
          query: payload.query ?? [],
        },
      },
      response: [],
    };
  }


  skeleton() {
    return {
      info: {
        name: "Baas Collection",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [],
    };
  }
};
