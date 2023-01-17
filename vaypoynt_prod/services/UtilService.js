const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const https = require("https");

exports.sqlDateFormat = function (date) {
  return date.toISOString().split("T")[0];
};

exports.sqlDateTimeFormat = function (date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

exports.createDirectoriesRecursive = function (folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

exports.getLocalPath = function (string) {
  if (string.includes("\\")) {
    return string.split("\\public")[1].replace(/\\/g, "/");
  } else {
    return string.split("/public")[1];
  }
};

exports.existPermission = function (permission, table, method) {
  return permission.models && permission.models[table] && permission.models[table][method];
};

exports.allowLambda = function (permission, originalUrl) {
  let lambdaList = {};
  let filteredList = {};

  for (let key in permission.authentication) {
    if (key.startsWith('lambda')) {
      lambdaList[key] = authArr[key];
    }
  }

  for (let key in lambdaList) {
    let lambdaString = key.replace('lambda', '').toLowerCase();

    if (lambdaString === '2fa') {
      lambdaString = 'twofa';
    }

    filteredList[lambdaString] = lambdaList[key];
  }

  for (let key in filteredList) {
    if (originalUrl.includes(key)) {
      if (filteredList[key] === true) {
        return true;
      }
    }
  }
  return false;
};

exports.randomString = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.filterEmptyFields = function (object, editEdition = false) {
  Object.keys(object).forEach((key) => {
    if (editEdition) {
      if (module.exports.emptyEditEdition(object[key])) {
        delete object[key];
      }
    } else {
      if (module.exports.empty(object[key])) {
        delete object[key];
      }
    }
  });
  return object;
};

exports.empty = function (value) {
  return value === "" || value === null || value === undefined || value === "undefined" || value === "null";
};
exports.emptyEditEdition = function (value) {
  return value === null || value === undefined || value === "undefined" || value === "null";
};

exports.sizeOfRemote = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, function (response) {
      const chunks = [];
      response
        .on("data", function (chunk) {
          chunks.push(chunk);
        })
        .on("end", function () {
          const buffer = Buffer.concat(chunks);
          resolve(sizeOf(buffer));
        });
    });
  });
};

exports.stringToHashConversion = function (string) {
  let hashVal = 0;
  if (string.length == 0) return hashVal;
  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    hashVal = (hashVal << 5) - hashVal + char;
    hashVal = hashVal & hashVal;
  }
  return hashVal;
};
