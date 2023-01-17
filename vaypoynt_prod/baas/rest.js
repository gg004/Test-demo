/**
 * So this file only helps with BAAS service only.
 * We will delete this module on final release.
 * All the project specific endpoints will be in lambda folder
 */
const express = require("express");
const { Parser } = require("json2csv");
let router = express.Router();
const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const DevLogService = require("../services/DevLogService");
const { existPermission, sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");
const ValidationService = require("../services/ValidationService");
const PaginationService = require("../services/PaginationService");
const CursorPaginationService = require("../services/CursorPaginationService");
const PreStrategy = require("./preStrategy");
const PostStrategy = require("./postStrategy");
const CountStrategy = require("./countStrategy");
const CheckProjectMiddleware = require("../middleware/CheckProjectMiddleware");
const AnalyticMiddleware = require("../middleware/AnalyticMiddleware");
const config = require("./../config");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
let logService = new DevLogService();
const { Readable } = require("stream");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

const allUserMiddlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(), // use it like this to verify role: TokenMiddleware({ role: "user" }),
  AnalyticMiddleware,
  multer().any()
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

const allUserMiddlewaresProduction = [
  ProjectMiddleware,
  CheckProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(), // use it like this to verify role: TokenMiddleware({ role: "user" }),
  AnalyticMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // RoleMiddleware
];

const publicMiddlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware
  // AnalyticMiddleware
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

async function parseCsv(Buffer) {
  return new Promise((resolve, reject) => {
    let data = [];
    try {
      const stream = Readable.from(Buffer);
      stream
        .pipe(csv())
        .on("data", async (row) => {
          data.push(row);
        })
        .on("end", async () => {
          resolve(data);
        });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = function (router) {
  /**
   * callRestAPI
   */

  router.post("/public/cms/GETALL", publicMiddlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();

      let validationJSON = {};
      if (config.env == "production") {
        const project = require("./../project");
        validationJSON = JSON.parse(project.validation);
      } else {
        sdk.setProjectId("manaknight");
        sdk.setTable("projects");

        const validationRow = await sdk.get({
          slug: req.projectId
        });

        if (!validationRow) {
          return res.status(403).json({
            error: true,
            message: "Validation Rules Not Set"
          });
        }
        validationJSON = JSON.parse(validationRow[0].validation);
      }

      let modelConfiguration = {};
      if (validationJSON.models) {
        modelConfiguration = validationJSON.models;
      }

      sdk.setProjectId(req.projectId);
      sdk.setTable("cms");
      const selectStr = "*";
      const orderBy = req.body.orderBy ? req.body.orderBy : "id";
      const direction = req.body.direction ? req.body.direction : "ASC";
      const getAllResult = await sdk.get(req.body.payload, selectStr, orderBy, direction, req.body.customWhere);

      let mapping = undefined;
      let blacklistFields = [];

      if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].mapping) {
        mapping = modelConfiguration[req.params.table].mapping;
      }

      if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].return_blacklist_field) {
        blacklistFields = modelConfiguration[req.params.table].return_blacklist_field;
      }

      return res.status(200).json({
        error: false,
        list: getAllResult.map((row) => {
          return sdk.blacklistField(row, blacklistFields);
        }),
        mapping: mapping
      });
    } catch (err) {
      console.error(err);
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });

  router.post("/rest/:table/:method", allUserMiddlewares, async function (req, res, next) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      let acl = {};

      if (config.env == "production") {
        const permissions = require("./../permission");
        acl = typeof permissions[req.role] == "string" ? JSON.parse(permissions[req.role]) : permissions[req.role];
      } else {
        sdk.setTable("permission");
        const permission = await sdk.get({
          role: req.role
        });
        console.log(permission);
        acl = JSON.parse(permission[0].permission);
      }

      switch (req.params.method) {
        case "POST":
          if (existPermission(acl, req.params.table, "POST")) {
            let validationJSON = {};

            if (config.env == "production") {
              const project = require("./../project");
              validationJSON = JSON.parse(project.validation);
            } else {
              sdk.setProjectId("manaknight");
              sdk.setTable("projects");
              const validationRow = await sdk.get({
                slug: req.projectId
              });

              if (!validationRow) {
                return res.status(403).json({
                  error: true,
                  message: "Validation Rules Not Set"
                });
              }
              validationJSON = JSON.parse(validationRow[0].validation);
            }
            const addValidationRules = validationJSON.addValidationRules;
            const validationMessages = validationJSON.validationRuleMessages;
            const validationResult = await ValidationService.validateInputMethod(
              addValidationRules[req.params.table],
              validationMessages[req.params.table],
              req
            );

            let modelConfiguration = {};

            if (validationJSON.models) {
              modelConfiguration = validationJSON.models;
            }

            if (validationResult.error) {
              return res.status(403).json(validationResult);
            }

            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            let payload = req.body;

            if (
              modelConfiguration &&
              modelConfiguration[req.params.table] &&
              modelConfiguration[req.params.table].pre &&
              modelConfiguration[req.params.table].pre.length > 0 &&
              typeof PreStrategy[modelConfiguration[req.params.table].pre] === "function"
            ) {
              payload = PreStrategy[modelConfiguration[req.params.table].pre](payload);
            }

            if (
              modelConfiguration &&
              modelConfiguration[req.params.table] &&
              modelConfiguration[req.params.table].fillable &&
              modelConfiguration[req.params.table].fillable.length > 0
            ) {
              payload = sdk.whitelistField(payload, modelConfiguration[req.params.table].fillable);
            }

            const insertResult = await sdk.insert({
              ...payload,
              create_at: sqlDateFormat(new Date()),
              update_at: sqlDateTimeFormat(new Date())
            });

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_CREATE", {
            //   ...payload,
            //   id: insertResult,
            //   model_name: req.params.table,
            // });
            return res.status(200).json({
              error: false,
              message: insertResult
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "PUT":
          if (existPermission(acl, req.params.table, "PUT")) {
            let validationJSON = {};

            if (config.env == "production") {
              const project = require("./../project");
              validationJSON = JSON.parse(project.validation);
            } else {
              sdk.setProjectId("manaknight");
              sdk.setTable("projects");
              const validationRow = await sdk.get({
                slug: req.projectId
              });

              if (!validationRow) {
                return res.status(403).json({
                  error: true,
                  message: "Validation Rules Not Set"
                });
              }
              validationJSON = JSON.parse(validationRow[0].validation);
            }

            // const editValidationRules = validationJSON.editValidationRules;
            // const validationMessages = validationJSON.validationRuleMessages;
            // const validationResult = await ValidationService.validateInputMethod(
            //   editValidationRules[req.params.table],
            //   validationMessages[req.params.table],
            //   req
            // );

            let modelConfiguration = {};
            if (validationJSON.models) {
              modelConfiguration = validationJSON.models;
            }

            // if (validationResult.error) {
            //   return res.status(403).json(validationResult);
            // }

            if (!req.body.id) {
              return res.status(403).json({
                error: true,
                message: "ID Missing",
                validation: { id: "id missing" }
              });
            }

            const id = req.body.id;
            let payload = req.body;
            delete payload.id;

            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            if (
              modelConfiguration &&
              modelConfiguration[req.params.table] &&
              modelConfiguration[req.params.table].post &&
              modelConfiguration[req.params.table].post.length > 0 &&
              typeof PostStrategy[modelConfiguration[req.params.table].post] === "function"
            ) {
              payload = PostStrategy[modelConfiguration[req.params.table].post](payload);
            }

            if (
              modelConfiguration &&
              modelConfiguration[req.params.table] &&
              modelConfiguration[req.params.table].fillable &&
              modelConfiguration[req.params.table].fillable.length > 0
            ) {
              payload = sdk.whitelistField(payload, modelConfiguration[req.params.table].fillable);
            }

            await sdk.update(
              {
                ...payload,
                update_at: sqlDateTimeFormat(new Date())
              },
              id
            );

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_UPDATE", {
            //   ...payload,
            //   id: id,
            //   model_name: req.params.table,
            // });

            return res.status(200).json({
              error: false,
              message: id
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        // Point: Update Record by Condition
        case "PUTWHERE":
          if (existPermission(acl, req.params.table, "PUTWHERE")) {
            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            if (Object.keys(req.body).length < 1) {
              return res.status(403).json({
                error: true,
                message: "Condition Missing", // If body is empty
                validation: [{ field: "", message: "condition missing" }]
              });
            }

            const validationArr = [];
            const reqBodyKeys = Object.keys(req.body);

            if (!req.body.set) {
              validationArr.push({ field: "set", message: `set is required` });
            }
            if (!req.body.where) {
              validationArr.push({ field: "where", message: `where is required` });
            }

            for (let i = 0; i < reqBodyKeys.length; i++) {
              if (reqBodyKeys[i] !== "set" && reqBodyKeys[i] !== "where") validationArr.push({ field: reqBodyKeys[i], message: "Invalid request parameter" });
            }

            if (validationArr.length > 0) {
              return res.status(403).json({
                error: true,
                message: "Validation Error",
                validation: validationArr
              });
            }

            await sdk.updateWhere(req.body.set, req.body.where);

            return res.status(200).json({
              error: false,
              message: "updated"
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "GET":
          if (existPermission(acl, req.params.table, "GET")) {
            let validationJSON = {};
            if (config.env == "production") {
              const project = require("./../project");
              validationJSON = JSON.parse(project.validation);
            } else {
              sdk.setProjectId("manaknight");
              sdk.setTable("projects");

              if (!req.body.id) {
                return res.status(403).json({
                  error: true,
                  message: "ID Missing",
                  validation: { id: "id missing" }
                });
              }

              const validationRow = await sdk.get({
                slug: req.projectId
              });

              if (!validationRow) {
                return res.status(403).json({
                  error: true,
                  message: "Validation Rules Not Set"
                });
              }
              validationJSON = JSON.parse(validationRow[0].validation);
            }

            let modelConfiguration = {};
            if (validationJSON.models) {
              modelConfiguration = validationJSON.models;
            }

            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            const getResult = await sdk.get({
              id: req.body.id
            });

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_SEARCH_ONE", {
            //   id: req.body.id,
            //   model_name: req.params.table,
            // });

            let mapping = undefined;
            let blacklistFields = [];

            if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].mapping) {
              mapping = modelConfiguration[req.params.table].mapping;
            }

            if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].return_blacklist_field) {
              blacklistFields = modelConfiguration[req.params.table].return_blacklist_field;
            }

            return res.status(200).json({
              error: false,
              model: sdk.blacklistField(getResult[0], blacklistFields),
              mapping: mapping
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "AUTOCOMPLETE":
          if (existPermission(acl, req.params.table, "AUTOCOMPLETE")) {
            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            if (!req.body.key) {
              return res.status(403).json({
                error: true,
                message: "Key Missing",
                validation: { key: "key missing" }
              });
            }

            if (!req.body.value) {
              return res.status(403).json({
                error: true,
                message: "Value Missing",
                validation: { value: "value missing" }
              });
            }

            if (!req.body.query) {
              return res.status(403).json({
                error: true,
                message: "query Missing",
                validation: { query: "query missing" }
              });
            }

            const autocompleteResult = await sdk.getStr([`${req.body.key} LIKE "%${req.body.query}%"`], `id, ${req.body.key}, ${req.body.value}`);

            return res.status(200).json({
              error: false,
              list: autocompleteResult.map((element) => {
                element.key = element[req.body.key];
                element.value = element[req.body.value];
                delete element.id;
                delete element[req.body.key];
                delete element[req.body.value];
                return element;
              })
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "DELETE":
          if (existPermission(acl, req.params.table, "DELETE")) {
            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            if (!req.body.id) {
              return res.status(403).json({
                error: true,
                message: "ID Missing",
                validation: { id: "id missing" }
              });
            }

            await sdk.delete({}, req.body.id);

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_DELETE", {
            //   id: req.body.id,
            //   model_name: req.params.table,
            // });

            return res.status(200).json({
              error: false,
              message: "deleted"
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "DELETEALL":
          if (existPermission(acl, req.params.table, "DELETE")) {
            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);

            if (Object.keys(req.body).length < 1) {
              return res.status(403).json({
                error: true,
                message: "Condition Missing",
                validation: { id: "condition missing" }
              });
            }

            await sdk.deleteWhere(req.body);

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_DELETE", {
            //   id: req.body.id,
            //   model_name: req.params.table
            // });

            return res.status(200).json({
              error: false,
              message: "deleted"
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "EXPORT":
          if (existPermission(acl, req.params.table, "EXPORT")) {
            let validationJSON = {};

            if (config.env == "production") {
              const project = require("./../project");
              validationJSON = JSON.parse(project.validation);
            } else {
              sdk.setProjectId("manaknight");
              sdk.setTable("projects");

              const validationRow = await sdk.get({
                slug: req.projectId
              });

              if (!validationRow) {
                return res.status(403).json({
                  error: true,
                  message: "Validation Rules Not Set"
                });
              }

              validationJSON = JSON.parse(validationRow[0].validation);
            }
            
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "IMPORT":

        if (existPermission(acl, req.params.table, "IMPORT")) {
          let validationJSON = {};

          if (config.env == "production") {
            const project = require("./../project");
            validationJSON = JSON.parse(project.validation);
          } else {
            sdk.setProjectId("manaknight");
            sdk.setTable("projects");

            const validationRow = await sdk.get({
              slug: req.projectId
            });

            if (!validationRow) {
              return res.status(403).json({
                error: true,
                message: "Validation Rules Not Set"
              });
            }

            validationJSON = JSON.parse(validationRow[0].validation);
          }

          let modelConfiguration = {};

          if (validationJSON.models) {
            modelConfiguration = validationJSON.models;
          }

          sdk.setProjectId(req.projectId);
          sdk.setTable(req.params.table);

          const records = await parseCsv(req.files[0].buffer);
          console.log("***", records);

          let mapping = undefined;
          let whitelistField = [];

          console.log(modelConfiguration);


          if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].reverse_mapping) {
            mapping = modelConfiguration[req.params.table].reverse_mapping;
          }

          if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].import_fields) {
            whitelistField = modelConfiguration[req.params.table].import_fields;
          }

          let postProcessedData = []
          
          for(let row of records){
            console.log(row);
            console.log(whitelistField);
            let postProcessRow = sdk.whitelistField(row, whitelistField);
            console.log(postProcessRow);
            if (mapping) {
              const mappingKey = Object.keys(mapping);
              for (let i = 0; i < mappingKey.length; i++) {
                const mappingValue = mappingKey[i];
                postProcessRow[mappingKey[i]] = mappingValue[postProcessRow[mappingKey[i]]];
              }
            }
            
            if(Object.keys(postProcessRow).length == 0) postProcessRow = {message: "Validation Failed. Not Imported"};
            else await sdk.insert({...postProcessRow, 
              create_at: sqlDateTimeFormat(new Date()),
              update_at: sqlDateTimeFormat(new Date())
            });
            postProcessedData.push(postProcessRow);
          };

          

          return res.status(200).json({
            succcess: true,
            imported_data: postProcessedData
          });
        } else {
          return res.status(403).json({
            error: true,
            message: "Invalid Resource"
          });
        }

          break;

        case "GETALL":
          if (existPermission(acl, req.params.table, "GETALL")) {
            let validationJSON = {};
            let configurationJSON = {};
            if (config.env == "production") {
              const project = require("./../project");
              validationJSON = JSON.parse(project.validation);
            } else {
              sdk.setProjectId("manaknight");
              sdk.setTable("projects");

              const validationRow = await sdk.get({
                slug: req.projectId
              });

              if (!validationRow) {
                return res.status(403).json({
                  error: true,
                  message: "Validation Rules Not Set"
                });
              }
              validationJSON = JSON.parse(validationRow[0].validation);
              configurationJSON = JSON.parse(validationRow[0].configuration);
            }

            let modelConfiguration = {};
            if (validationJSON.models) {
              modelConfiguration = validationJSON.models;
            }

            sdk.setProjectId(req.projectId);
            sdk.setTable(req.params.table);
            const selectStr = "*";
            const orderBy = req.body.orderBy ? req.body.orderBy : "id";
            const direction = req.body.direction ? req.body.direction : "ASC";

            const getAllResult = await sdk.get(req.body.payload, selectStr, orderBy, direction, req.body.customWhere);

            let mapping = undefined;
            let blacklistFields = [];
            let tableConfiguration =
              configurationJSON && configurationJSON["models"] && configurationJSON.models.filter((item) => item.name == req.params.table);

            if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].mapping) {
              mapping = modelConfiguration[req.params.table].mapping;
            }

            if (tableConfiguration && tableConfiguration.length == 1 && tableConfiguration[0].mapping) {
              mapping = tableConfiguration[0].mapping;
            }

            if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].return_blacklist_field) {
              blacklistFields = modelConfiguration[req.params.table].return_blacklist_field;
            }

            return res.status(200).json({
              error: false,
              list: getAllResult.map((row) => {
                return sdk.blacklistField(row, blacklistFields);
              }),
              mapping: mapping
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

          case "PAGINATE":
            if (existPermission(acl, req.params.table, "PAGINATE")) {
              let validationJSON = {};
              let configurationJSON = {};
  
              if (config.env == "production") {
                const project = require("./../project");
                validationJSON = JSON.parse(project.validation);
              } else {
                sdk.setProjectId("manaknight");
                sdk.setTable("projects");
  
                const selectStr = "*";
                const orderBy = req.body.orderBy ? req.body.orderBy : "id";
                const direction = req.body.direction ? req.body.direction : "ASC";
  
                const validationRow = await sdk.get({ slug: req.projectId }, selectStr, orderBy, direction);
  
                if (!validationRow) {
                  return res.status(403).json({
                    error: true,
                    message: "Validation Rules Not Set"
                  });
                }
  
                validationJSON = JSON.parse(validationRow[0].validation);
                if (validationRow[0].configuration) {
                  configurationJSON = JSON.parse(validationRow[0].configuration);
                }
              }
  
              let modelConfiguration = {};
              if (validationJSON.models) {
                modelConfiguration = validationJSON.models;
              }
  
              sdk.setProjectId(req.projectId);
              sdk.setTable(req.params.table);
  
              const validationResult = await ValidationService.validateInputMethod(
                {
                  page: "required",
                  limit: "required"
                },
                {
                  page: "page is missing",
                  limit: "limit is missing"
                },
                req
              );
  
              if (validationResult.error) {
                return res.status(403).json(validationResult);
              }
  
              let paginationService = new PaginationService(req.body.page, req.body.limit);
              paginationService.setSortField(req.body.sortId);
              paginationService.setSortDirection(req.body.direction);
  
              //TODO: COUNT HOOK
  
              paginationService.setCount(
                await sdk.count(
                  req.body.payload,
                  paginationService.getPage(),
                  paginationService.getLimit(),
                  paginationService.getSortField(),
                  paginationService.getSortDirection()
                )
              );
  
              const getAllResult = await sdk.paginate(
                req.body.payload,
                "*",
                paginationService.getPage(),
                paginationService.getLimit(),
                paginationService.getSortField(),
                paginationService.getSortDirection(),
                req.body.customWhere
              );
  
              // const triggerRuleService = new MkdEventService(sdk, req.projectId);
              // await triggerRuleService.executeRule("MODEL_SEARCH", {
              //   ...req.body,
              //   model_name: req.params.table,
              // });
  
              let mapping = undefined;
              let blacklistFields = [];
              let tableConfiguration =
                configurationJSON && configurationJSON["models"] && configurationJSON.models.filter((item) => item.name == req.params.table);
  
              if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].mapping) {
                mapping = modelConfiguration[req.params.table].mapping;
              }
  
              if (tableConfiguration && tableConfiguration.length == 1 && tableConfiguration[0].mapping) {
                mapping = tableConfiguration[0].mapping;
              }
  
              if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].return_blacklist_field) {
                blacklistFields = modelConfiguration[req.params.table].return_blacklist_field;
              }
              console.log(modelConfiguration, req.params.table);
              return res.status(200).json({
                error: false,
                list: getAllResult.map((row) => {
                  return sdk.blacklistField(row, blacklistFields);
                }),
                page: paginationService.getPage(),
                limit: paginationService.getLimit(),
                total: paginationService.getCount(),
                num_pages: paginationService.getNumPages(),
                mapping: mapping
              });
            } else {
              return res.status(403).json({
                error: true,
                message: "Invalid Resource"
              });
            }
            break;
  
        
          case "CURSORPAGINATE":
            if (existPermission(acl, req.params.table, "PAGINATE")) {
              let validationJSON = {};
              let configurationJSON = {};
              const db = sdk.getDatabase();
  
              if (config.env == "production") {
                const project = require("./../project");
                validationJSON = JSON.parse(project.validation);
              } else {
                sdk.setProjectId("manaknight");
                sdk.setTable("projects");
  
                const validationRow = await sdk.get({ slug: req.projectId }, '*', 'id', 'ASC');
  
                if (!validationRow) {
                  return res.status(403).json({
                    error: true,
                    message: "Validation Rules Not Set"
                  });
                }
  
                validationJSON = JSON.parse(validationRow[0].validation);
                if (validationRow[0].configuration) {
                  configurationJSON = JSON.parse(validationRow[0].configuration);
                }
              }
  
              let modelConfiguration = {};
              if (validationJSON.models) {
                modelConfiguration = validationJSON.models;
              }
  
              sdk.setProjectId(req.projectId);
              sdk.setTable(req.params.table);
  
              // let paginationService = new PaginationService(req.body.page, req.body.limit);
              let paginationService = new CursorPaginationService(req.body.cursor, req.body.limit);
  
              //TODO: COUNT HOOK
  
              const where = req.body.where;
              let keys = [];
              if(where){
                keys = Object.keys(where).length > 0 ? [...Object.keys(where)] : [];
              }
              let sql = `SELECT * FROM ${sdk.getTable()}`
              sql += ` WHERE`
              if(keys.length > 0){
                for (let i = 0; i < keys.length; i++) {
                  const element = keys[i];
                  if(i < keys.length - 1){
                    sql += ` ${element} = ${where[element]} AND `
                  }
                }
              }
              const cursor = req.body.cursor || 0;
              const limit = req.body.limit || 10;
              const customWhere = req.body.customWhere || "";
  
              if(customWhere) sql += customWhere
  
              sql += ` ${sdk.getTable()}.id > ${cursor} LIMIT ${limit}`
  
              let response = (await db.query(sql))[0]
  
              const nextCursor = response.length > 0 ? (response[response.length - 1]).id : 0
  
              let mapping = undefined;
              let blacklistFields = [];
              let tableConfiguration =
                configurationJSON && configurationJSON["models"] && configurationJSON.models.filter((item) => item.name == req.params.table);
  
              if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].mapping) {
                mapping = modelConfiguration[req.params.table].mapping;
              }
  
              if (tableConfiguration && tableConfiguration.length == 1 && tableConfiguration[0].mapping) {
                mapping = tableConfiguration[0].mapping;
              }
  
              if (modelConfiguration && modelConfiguration[req.params.table] && modelConfiguration[req.params.table].return_blacklist_field) {
                blacklistFields = modelConfiguration[req.params.table].return_blacklist_field;
              }
              console.log(modelConfiguration, req.params.table);
              response = response.map((row) => {
                return sdk.blacklistField(row, blacklistFields);
              })

              return res.status(200).json({
                error: false,
                list: response,
                cursor,
                nextCursor,
                limit,
              });
            } else {
              return res.status(403).json({
                error: true,
                message: "Invalid Resource"
              });
            }
            break;

        default:
          res.status(403);
          res.json({
            message: "Invalid Method"
          });
          break;
      }
    } catch (err) {
      console.error(err);
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });
  /**
   * callJoinRestAPI
   */
  router.post("/join/:table1/:table2/:method", allUserMiddlewares, async function (req, res, next) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);

      let acl = {};
      let configurationJSON = {};
      if (config.env == "production") {
        const permissions = require("./../permission");
        acl = typeof permissions[req.role] == "string" ? JSON.parse(permissions[req.role]) : permissions[req.role];
      } else {
        sdk.setTable("permission");
        const permission = await sdk.get({
          role: req.role
        });

        acl = JSON.parse(permission[0].permission);
      }

      // logService.log(acl);
      let validationJSON = {};

      if (config.env == "production") {
        const project = require("./../project");
        validationJSON = JSON.parse(project.validation);
        configurationJSON = JSON.parse(validationRow[0].configuration);
      } else {
        sdk.setProjectId("manaknight");
        sdk.setTable("projects");

        const validationRow = await sdk.get({
          slug: req.projectId
        });

        if (!validationRow) {
          return res.status(403).json({
            error: true,
            message: "Validation Rules Not Set"
          });
        }

        validationJSON = JSON.parse(validationRow[0].validation);
        configurationJSON = JSON.parse(validationRow[0].configuration);
      }

      let modelConfiguration = {};
      if (validationJSON.models) {
        modelConfiguration = validationJSON.models;
      }

      switch (req.params.method) {
        case "GETALL":
          if (existPermission(acl, req.params.table1, "GETALL") && existPermission(acl, req.params.table2, "GETALL")) {
            sdk.setProjectId(req.projectId);
            const getAllResult = await sdk.join(
              req.params.table1,
              req.params.table2,
              req.body.join_id_1,
              req.body.join_id_2,
              req.body.select ? req.body.select : " * ",
              req.body.where || ""
            );

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_JOIN_SEARCH", {
            //   table1: req.params.table1,
            //   table2: req.params.table2,
            //   join_1: req.body.join_id_1,
            //   join_2: req.body.join_id_2,
            //   select: req.body.select ? req.body.select : "",
            //   payload: req.body.payload,
            // });

            let tableConfiguration1 =
              configurationJSON && configurationJSON["models"] && configurationJSON.models.filter((item) => item.name == req.params.table1);
            let tableConfiguration2 =
              configurationJSON && configurationJSON["models"] && configurationJSON.models.filter((item) => item.name == req.params.table2);

            let mappingTable1 = undefined;
            if (modelConfiguration && modelConfiguration[req.params.table1] && modelConfiguration[req.params.table1].mapping) {
              mappingTable1 = modelConfiguration[req.params.table1].mapping;
            }

            if (tableConfiguration1 && tableConfiguration1.length == 1 && tableConfiguration1[0].mapping) {
              mappingTable1 = tableConfiguration1[0].mapping;
            }
            let mappingTable2 = undefined;
            if (modelConfiguration && modelConfiguration[req.params.table2] && modelConfiguration[req.params.table2].mapping) {
              mappingTable2 = modelConfiguration[req.params.table2].mapping;
            }

            if (tableConfiguration2 && tableConfiguration2.length == 1 && tableConfiguration2[0].mapping) {
              mappingTable2 = tableConfiguration2[0].mapping;
            }

            return res.status(200).json({
              error: false,
              list: getAllResult,
              mapping_table1: mappingTable1,
              mapping_table2: mappingTable2
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        case "PAGINATE":
          if (existPermission(acl, req.params.table1, "PAGINATE") && existPermission(acl, req.params.table2, "PAGINATE")) {
            sdk.setProjectId(req.projectId);

            const validationResult = await ValidationService.validateInputMethod(
              {
                page: "required",
                limit: "required"
              },
              {
                page: "page is missing",
                limit: "limit is missing"
              },
              req
            );

            if (validationResult.error) {
              return res.status(403).json(validationResult);
            }

            let paginationService = new PaginationService(req.body.page, req.body.limit);
            paginationService.setSortField(req.body.sortId);
            paginationService.setSortDirection(req.body.direction);

            paginationService.setCount(await sdk.joinCount(req.params.table1, req.params.table2, req.body.join_id_1, req.body.join_id_2, req.body.where));

            const getAllResult = await sdk.joinPaginate(
              req.params.table1,
              req.params.table2,
              req.body.join_id_1,
              req.body.join_id_2,
              req.body.select ? req.body.select : "",
              req.body.where,
              paginationService.getPage() - 1,
              paginationService.getLimit(),
              paginationService.getSortField(),
              paginationService.getSortDirection()
            );

            // const triggerRuleService = new MkdEventService(sdk, req.projectId);
            // await triggerRuleService.executeRule("MODEL_SEARCH", {
            //   ...req.body,
            //   model_name: req.params.table,
            // });

            let mappingTable1 = undefined;
            if (modelConfiguration && modelConfiguration[req.params.table1] && modelConfiguration[req.params.table1].mapping) {
              mappingTable1 = modelConfiguration[req.params.table1].mapping;
            }

            let mappingTable2 = undefined;
            if (modelConfiguration && modelConfiguration[req.params.table2] && modelConfiguration[req.params.table2].mapping) {
              mappingTable2 = modelConfiguration[req.params.table2].mapping;
            }

            return res.status(200).json({
              error: false,
              list: getAllResult,
              page: paginationService.getPage(),
              limit: paginationService.getLimit(),
              total: paginationService.getCount(),
              num_pages: paginationService.getNumPages(),
              mapping_table1: mappingTable1,
              mapping_table2: mappingTable2
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        default:
          res.status(403);
          res.json({
            error: true,
            message: "Invalid Method"
          });
          break;
      }
    } catch (err) {
      console.error(err);
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });

  // Part: Join Multiple Tables
  router.post("/multi-join/:method", allUserMiddlewares, async function (req, res, next) {
    let permission = {};
    let acl = {};
    let sdk = req.app.get("sdk");
    sdk.getDatabase();
    sdk.setProjectId(req.projectId);

    try {
      if (config.env == "production") {
        let permissions = require("./../permission");
        acl = typeof permissions[req.role] == "string" ? JSON.parse(permissions[req.role]) : permissions[req.role];
      } else {
        sdk.setTable("permission");
        permission = await sdk.get({
          role: req.role
        });

        acl = JSON.parse(permission[0].permission);

        sdk.setProjectId("manaknight");
        sdk.setTable("projects");

        const validationRow = await sdk.get({
          slug: req.projectId
        });

        if (!validationRow) {
          return res.status(403).json({
            error: true,
            message: "Validation Rules Not Set"
          });
        }
      }

      switch (req.params.method) {
        case "PAGINATE":
          if (req.body.tables.every((table) => existPermission(acl, table, "PAGINATE"))) {
            sdk.setProjectId(req.projectId);

            const validationResult = await ValidationService.validateInputMethod(
              {
                tables: "required",
                page: "required",
                limit: "required"
              },
              {
                tables: "tables is missing",
                page: "page is missing",
                limit: "limit is missing"
              },
              req
            );

            if (validationResult.error) {
              return res.status(403).json(validationResult);
            }

            let paginationService = new PaginationService(req.body.page, req.body.limit);
            paginationService.setSortField(req.body.sortId);
            paginationService.setSortDirection(req.body.direction);

            paginationService.setCount(await sdk.joinMultiCountStr(req.body.tables, req.body.joinIds, req.body.where || []));

            const getAllResult = await sdk.joinMultiPaginateStr(
              req.body.tables,
              req.body.joinIds,
              req.body.selectStr || "*",
              req.body.where || [],
              paginationService.getPage() - 1,
              paginationService.getLimit(),
              paginationService.getSortField(),
              paginationService.getSortDirection()
            );

            return res.status(200).json({
              error: false,
              list: getAllResult,
              page: paginationService.getPage(),
              limit: paginationService.getLimit(),
              total: paginationService.getCount(),
              num_pages: paginationService.getNumPages()
            });
          } else {
            return res.status(403).json({
              error: true,
              message: "Invalid Resource"
            });
          }
          break;

        default:
          res.status(403);
          res.json({
            error: true,
            message: "Invalid Method"
          });
          break;
      }
    } catch (err) {
      console.error(err);
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });

  return router;
};
