const config = require("../config");
const fs = require("fs");

module.exports = class PostmanAPIService {
  constructor() { }

  createJson(models, permissions, base64ProjectId, projectId, app) {

    // console.log(models, permissions);

    let json = this.skeleton();
    json.info.name = projectId;
    let self = this;
    fs.readdirSync(__dirname + "/../lambda").forEach(function (file) {
      if (file === "index.js" || file.substr(file.lastIndexOf(".") + 1) !== "js") return;
      let name = file.substr(0, file.indexOf("."));
      let results = require(__dirname + "/../lambda/" + name)(app);
      // console.log(results, name);
      if (results.length > 0 && results[0].method) {
        for (let i = 0; i < results.length; i++) {
          let result = results[i];
          if (result.method && result.method == "GET") {
            json.item.push(
              self.generateLambdaGETRequest(
                result.name,
                config.app_url,
                result.url,
                base64ProjectId,
                result.successPayload,
                result.needToken,
                result.queryBody,
                result.errors
              )
            );
          }
          if (result.method && result.method == "POST") {
            json.item.push(
              self.generateLambdaPOSTRequest(
                result.name,
                config.app_url,
                result.url,
                base64ProjectId,
                result.successBody,
                result.successPayload,
                result.needToken,
                result.errors
              )
            );
          }
        }
      }
    });

    //TODO fix this
    fs.readdirSync(__dirname + "/../custom/" + projectId).forEach(function (file) {
      if (file === "index.js" || file.substr(file.lastIndexOf(".") + 1) !== "js") return;
      let name = file.substr(0, file.indexOf("."));
      let results = require(__dirname + "/../custom/" + projectId + "/" + name)(app);

      if (results.length > 0 && results[0].method) {
        for (let i = 0; i < results.length; i++) {
          let result = results[i];
          if (result.method && result.method == "GET") {
            json.item.push(
              self.generateLambdaGETRequest(
                result.name,
                config.app_url,
                result.url,
                base64ProjectId,
                result.successPayload,
                result.needToken,
                result.queryBody,
                result.errors
              )
            );
          }
          if (result.method && result.method == "POST") {
            json.item.push(
              self.generateLambdaPOSTRequest(
                result.name,
                config.app_url,
                result.url,
                base64ProjectId,
                result.successBody,
                result.successPayload,
                result.needToken,
                result.errors
              )
            );
          }
          if (result.method && result.method == "PUT") {
            json.item.push(
              self.generateLambdaPUTRequest(
                result.name,
                config.app_url,
                result.url,
                base64ProjectId,
                result.successBody,
                result.successPayload,
                result.needToken,
                result.errors
              )
            );
          }
        }
      }
    });

    return json;
  }

  generateLambdaGETRequest(name, hostname, url, base64ProjectId, successPayload, needToken, queryBody, errors) {
    const urlObject = {
      raw: hostname + url,
      protocol: "https",
      host: [hostname],
      path: url.split("/").filter(Boolean),
      query: queryBody,
    };

    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    const regularResponse = [
      this.generateGETSuccessResponse(successPayload, urlObject, base64ProjectId, needToken),
      {
        name: "401 unauthorized error",
        originalRequest: {
          method: "GET",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: [
          {
            key: "Content-Type",
            name: "Content-Type",
            value: "application/json",
            type: "json",
          },
        ],
        cookie: [],
        body: '{"error": true, "message": "UNAUTHORIZED", "code": "UNAUTHORIZED"}',
      },
      {
        name: "401 token error",
        originalRequest: {
          method: "GET",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true, "message": "TOKEN_EXPIRED", "code": "TOKEN_EXPIRED"}',
      },
    ];

    let responseErrors = [];

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      responseErrors.push(this.generateErrorGetResponse(error.query, error.response, error.name, needToken, base64ProjectId, urlObject));
    }

    return {
      name: name,
      protocolProfileBehavior: {
        disableBodyPruning: true,
      },
      request: {
        method: "GET",
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        body: {
          mode: "raw",
          raw: "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: urlObject,
      },
      response: [...regularResponse, ...responseErrors],
    };
  }

  generateLambdaPOSTRequest(name, hostname, url, base64ProjectId, successBody, successPayload, needToken, errors) {
    const urlObject = {
      raw: hostname + url,
      protocol: "https",
      host: [hostname],
      path: url.split("/").filter(Boolean),
    };

    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    const responseRegular = [
      this.generatePOSTSuccessResponse(successBody, successPayload, urlObject, base64ProjectId, needToken),
      {
        name: "401 unauthorized error",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: [
          {
            key: "Content-Type",
            name: "Content-Type",
            value: "application/json",
            type: "json",
          },
        ],
        cookie: [],
        body: '{"error": true, "message": "UNAUTHORIZED", "code": "UNAUTHORIZED"}',
      },
      {
        name: "401 token error",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true, "message": "TOKEN_EXPIRED", "code": "TOKEN_EXPIRED"}',
      },

      {
        name: "401",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID missing"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: [
          {
            key: "Content-Type",
            name: "Content-Type",
            value: "application/json",
            type: "json",
          },
        ],
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid Format"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid Sections"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "POST",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid"}',
      },
    ];
    let responseErrors = [];

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      responseErrors.push(this.generateErrorPostResponse(error.body, error.response, error.name, needToken, base64ProjectId, urlObject));
    }

    return {
      name: name,
      protocolProfileBehavior: {
        disableBodyPruning: true,
      },
      request: {
        method: "POST",
        body: {
          mode: "raw",
          raw: successBody,
          options: {
            raw: {
              language: "json",
            },
          },
        },
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        url: urlObject,
      },
      response: [...responseRegular, ...responseErrors],
    };
  }

  generateLambdaPUTRequest(name, hostname, url, base64ProjectId, successBody, successPayload, needToken, errors) {
    const urlObject = {
      raw: hostname + url,
      protocol: "https",
      host: [hostname],
      path: url.split("/").filter(Boolean),
    };

    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    const responseRegular = [
      this.generatePUTSuccessResponse(successBody, successPayload, urlObject, base64ProjectId, needToken),
      {
        name: "401 unauthorized error",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: [
          {
            key: "Content-Type",
            name: "Content-Type",
            value: "application/json",
            type: "json",
          },
        ],
        cookie: [],
        body: '{"error": true, "message": "UNAUTHORIZED", "code": "UNAUTHORIZED"}',
      },
      {
        name: "401 token error",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true, "message": "TOKEN_EXPIRED", "code": "TOKEN_EXPIRED"}',
      },

      {
        name: "401",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID missing"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: [
          {
            key: "Content-Type",
            name: "Content-Type",
            value: "application/json",
            type: "json",
          },
        ],
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid Format"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid Sections"}',
      },
      {
        name: "401",
        originalRequest: {
          method: "PUT",
          url: urlObject,
          header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
          body: {
            mode: "raw",
            raw: "",
            options: {
              raw: {
                language: "json",
              },
            },
          },
        },
        status: "Unauthorized",
        code: 401,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        cookie: [],
        body: '{"error": true,"code": 401,"message": "Project ID Invalid"}',
      },
    ];
    let responseErrors = [];

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      responseErrors.push(this.generateErrorPutResponse(error.body, error.response, error.name, needToken, base64ProjectId, urlObject));
    }

    return {
      name: name,
      protocolProfileBehavior: {
        disableBodyPruning: true,
      },
      request: {
        method: "PUT",
        body: {
          mode: "raw",
          raw: successBody,
          options: {
            raw: {
              language: "json",
            },
          },
        },
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        url: urlObject,
      },
      response: [...responseRegular, ...responseErrors],
    };
  }

  generateGETSuccessResponse(payload, urlObject, base64ProjectId, needToken) {
    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    return {
      name: "200",
      originalRequest: {
        method: "GET",
        url: urlObject,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
      },
      status: "OK",
      code: 200,
      header: [
        {
          key: "Content-Type",
          name: "Content-Type",
          value: "application/json",
          type: "json",
        },
      ],
      cookie: [],
      body: payload,
    };
  }

  generatePOSTSuccessResponse(body, payload, urlObject, base64ProjectId, needToken) {
    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    return {
      name: "200",
      originalRequest: {
        method: "POST",
        url: urlObject,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        body: {
          mode: "raw",
          raw: body,
          options: {
            raw: {
              language: "json",
            },
          },
        },
      },
      status: "OK",
      code: 200,
      header: [
        {
          key: "Content-Type",
          name: "Content-Type",
          value: "application/json",
          type: "json",
        },
      ],
      cookie: [],
      body: payload,
    };
  }

  generateErrorPostResponse(body, payload, code, needToken, base64ProjectId, urlObject) {
    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    return {
      name: code,
      originalRequest: {
        method: "POST",
        url: urlObject,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        body: {
          mode: "raw",
          raw: body,
          options: {
            raw: {
              language: "json",
            },
          },
        },
      },
      status: "Forbidden",
      code: code,
      header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
      cookie: [],
      body: payload,
    };
  }

  generateErrorPutResponse(body, payload, code, needToken, base64ProjectId, urlObject) {
    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    return {
      name: code,
      originalRequest: {
        method: "PUT",
        url: urlObject,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        body: {
          mode: "raw",
          raw: body,
          options: {
            raw: {
              language: "json",
            },
          },
        },
      },
      status: "Forbidden",
      code: code,
      header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
      cookie: [],
      body: payload,
    };
  }

  generateErrorGetResponse(body, payload, code, needToken, base64ProjectId, urlObject) {
    urlObject.query = body;
    const tokenPayload = {
      key: "Authorization",
      value: "Bearer token",
      type: "text",
    };

    const regularPayload = [
      {
        key: "Content-Type",
        name: "Content-Type",
        value: "application/json",
        type: "json",
      },
      {
        key: "x-project",
        value: base64ProjectId,
        type: "text",
      },
    ];

    return {
      name: code,
      originalRequest: {
        method: "GET",
        url: urlObject,
        header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
        body: {
          mode: "raw",
          raw: "",
          options: {
            raw: {
              language: "json",
            },
          },
        },
      },
      status: "Forbidden",
      code: code,
      header: needToken ? [tokenPayload, ...regularPayload] : regularPayload,
      cookie: [],
      body: payload,
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
