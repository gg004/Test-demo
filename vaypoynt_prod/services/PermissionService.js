const config = require("../config");
const { sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");

module.exports = class PermissionService {
  constructor(sdk, projectId, header) {
    this._sdk = sdk;
    this._header = header;
    this._sdk.setProjectId(projectId);
  }

  async validate(originalUrl) {
    try {
      this._sdk.setTable("permission");
      const result = await this._sdk.get({}, "permission");

      // console.log(result[0].permission);

      let authArr = JSON.parse(result[0].permission).authentication;
      // console.log(authArr);
      // remove key from array which not starts with lambda
      let lambdaArr = {};
      for (let key in authArr) {
        if (key.startsWith("lambda")) {
          lambdaArr[key] = authArr[key];
        }
      }

      // console.log(lambdaArr);
      let filteredArr = {};
      // remove lambda string from lambdaArr each key
      for (let key in lambdaArr) {
        let lambdaString = key.replace("lambda", "");
        // make all lambda string lowercase
        // if lambdaString is 2fa then make it twofa
        lambdaString = lambdaString.toLowerCase();
        if (lambdaString === "2fa") {
          lambdaString = "twofa";
        }
        filteredArr[lambdaString] = lambdaArr[key];
      }

      for (let key in filteredArr) {
        if (originalUrl.includes(key)) {
          if (filteredArr[key] === true) {
            return {
              error: false,
              message: "Permission granted"
            };
          }
        }
      }

      return {
        error: true,
        message: "Permission denied"
      };
    } catch (error) {
      console.log("Lambda Errors:", error);
      return {
        error: true,
        message: error.message
      };
    }
  }
};
