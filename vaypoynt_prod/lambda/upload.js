const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const DevLogService = require("../services/DevLogService");
const UploadService = require("../services/UploadService");
const { getLocalPath, sqlDateFormat, sqlDateTimeFormat, sizeOfRemote } = require("../services/UtilService");
const sizeOf = require("image-size");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const upload = UploadService.local_upload();
const uploadS3 = UploadService.s3_upload();
const fs = require("fs");

const imageMiddlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  upload.single("file"),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];
const imageMiddlewaresS3 = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  uploadS3.single("file"),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];
const imagesMiddlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  upload.array("files"),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];
const imagesMiddlewaresS3 = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware(),
  uploadS3.array("files"),
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];
let logService = new DevLogService();

module.exports = function (app) {
  app.post("/v2/api/lambda/upload", imageMiddlewares, async function (req, res) {
    try {
      const url = getLocalPath(req.file.path);

      let params = {
        url: url,
        user_id: req.user_id || null,
        caption: req.body.caption || null,
        type: 1,
        width: 0,
        height: 0,
      };
      const whitelist = ["image/png", "image/jpeg", "image/jpg"];

      const uploadedfile = fs.readFileSync(req.file.path);

      if (whitelist.includes(req.file.mimetype)) {
        const dimensions = sizeOf(uploadedfile);
        params.width = dimensions.width;
        params.height = dimensions.height;
        params.type = 0;
      }

      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      logService.log(req.body);
      logService.log(req.user_id);

      const result = await sdk.insert({
        url: params.url,
        caption: params.caption,
        user_id: req.user_id,
        width: params.width,
        height: params.height,
        type: params.type,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
      });

      return res.status(201).json({ id: result, url });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: error.message });
    }
  });
  app.post("/v2/api/lambda/s3/upload", imageMiddlewaresS3, async function (req, res) {
    try {
      const url = req.file.location;

      let params = {
        url: url,
        user_id: req.user_id || null,
        caption: req.body.caption || null,
        type: 1,
        width: 0,
        height: 0,
      };
      const whitelist = ["image/png", "image/jpeg", "image/jpg"];

      if (whitelist.includes(req.file.mimetype)) {
        const dimensions = await sizeOfRemote(url);
        params.width = dimensions.width;
        params.height = dimensions.height;
        params.type = 0;
      }

      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      logService.log(req.body);
      logService.log(req.user_id);

      const result = await sdk.insert({
        url: params.url,
        caption: params.caption,
        user_id: req.user_id,
        width: params.width,
        height: params.height,
        type: params.type,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
      });

      return res.status(201).json({ id: result, url });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: error.message });
    }
  });

  /**
   * uploads
   */
  app.post("/v2/api/lambda/uploads/only", imagesMiddlewares, function (req, res, next) {
    try {
      let urlArray = [];
      for (const file of req.files) {
        const url = getLocalPath(file.path);
        urlArray.push(url);
      }
      return res.status(201).json({ success: true, attachments: JSON.stringify(urlArray) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });
  /**
   * uploads S3
   */
  app.post("/v2/api/lambda/s3/uploads/only", imagesMiddlewaresS3, function (req, res, next) {
    try {
      let urlArray = [];
      for (const file of req.files) {
        const url = file.location;
        urlArray.push(url);
      }
      return res.status(201).json({ success: true, attachments: JSON.stringify(urlArray) });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });

  /**
   * uploads
   */
  app.post("/v2/api/lambda/uploads", imagesMiddlewares, async function (req, res, next) {
    try {
      let urlArray = [];
      let urlArrayObject = [];
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      for (const file of req.files) {
        const url = getLocalPath(file.path);
        urlArray.push(url);
        let width = 0;
        let height = 0;
        let type = 1;

        if (!req.file.mimetype.includes("video")) {
          const uploadedfile = fs.readFileSync(file.path);
          const dimensions = sizeOf(uploadedfile);
          width = dimensions.width;
          height = dimensions.height;
          type = 0;
        }

        const result = await sdk.insert({
          url: url,
          caption: "",
          user_id: req.user_id,
          width: width,
          height: height,
          type: type,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        urlArrayObject.push({ id: result, url: url });
      }
      return res.status(201).json({ success: true, attachments: urlArrayObject });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });

  /**
   * uploads S3
   */
  app.post("/v2/api/lambda/s3/uploads", imagesMiddlewaresS3, async function (req, res, next) {
    try {
      let urlArray = [];
      let urlArrayObject = [];
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      for (const file of req.files) {
        const url = file.location;
        urlArray.push(url);
        let width = 0;
        let height = 0;
        let type = 1;

        if (!file.mimetype.includes("video")) {
          const dimensions = await sizeOfRemote(file.location);
          width = dimensions.width;
          height = dimensions.height;
          type = 0;
        }

        const result = await sdk.insert({
          url: url,
          caption: "",
          user_id: req.user_id,
          width: width,
          height: height,
          type: type,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        urlArrayObject.push({ id: result, url: url });
      }
      return res.status(201).json({ success: true, attachments: urlArrayObject });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });

  /**
   * uploads file
   */
  app.post("/v2/api/lambda/uploads/file", imagesMiddlewares, async function (req, res, next) {
    try {
      let urlArray = [];
      let urlArrayObject = [];
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      for (const file of req.files) {
        const url = getLocalPath(file.path);
        urlArray.push(url);
        let width = 0;
        let height = 0;
        let type = 2;

        const result = await sdk.insert({
          url: url,
          caption: "",
          user_id: req.user_id,
          width: width,
          height: height,
          type: type,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        urlArrayObject.push({ id: result, url: url });
      }
      return res.status(201).json({ success: true, attachments: urlArrayObject });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });

  /**
   * uploads S3
   */
  app.post("/v2/api/lambda/s3/uploads/file", imagesMiddlewaresS3, async function (req, res, next) {
    try {
      let urlArray = [];
      let urlArrayObject = [];
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("photo");

      for (const file of req.files) {
        const url = file.location;
        urlArray.push(url);
        let width = 0;
        let height = 0;
        let type = 2;

        const result = await sdk.insert({
          url: url,
          caption: "",
          user_id: req.user_id,
          width: width,
          height: height,
          type: type,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
        });

        urlArrayObject.push({ id: result, url: url });
      }
      return res.status(201).json({ success: true, attachments: urlArrayObject });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: true, message: error.message });
    }
  });
  return [
    {
      method: "POST",
      name: "Upload API",
      url: "/v2/api/lambda/upload",
      successBody: '{"caption": "some caption", "file":  "some file but use form data"}',
      successPayload: '{"id":2,url: "uploaded file url"}',
      errors: [
        {
          name: "403",
          body: '{ "caption": "some caption"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "S3 Upload API",
      url: "/v2/api/lambda/s3/upload",
      successBody: '{"caption": "some caption"}',
      successPayload: '{"id":2,url: "uploaded file url"}',
      errors: [
        {
          name: "403",
          body: '{ "caption": "some caption"}',
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Uploads API",
      url: "/v2/api/lambda/uploads/only",
      successBody: "",
      successPayload: '{"success":true, "attachment": ["link1","link2"]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "S3 Uploads API",
      url: "/v2/api/lambda/s3/uploads/only",
      successBody: "",
      successPayload: '{"success":true, "attachment": ["link1","link2"]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Uploads API",
      url: "/v2/api/lambda/uploads",
      successBody: "",
      successPayload: '{"success":true, "attachments": [{"id": 3, "url":"link1"},{"id": 4, "url":"link2"}]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "S3 Uploads API",
      url: "/v2/api/lambda/s3/uploads",
      successBody: "",
      successPayload: '{"success":true, "attachments": [{"id": 3, "url":"link1"},{"id": 4, "url":"link2"}]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Uploads File API",
      url: "/v2/api/lambda/uploads/file",
      successBody: "",
      successPayload: '{"success":true, "attachments": [{"id": 3, "url":"link1"},{"id": 4, "url":"link2"}]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Uploads File API",
      url: "/v2/api/lambda/s3/uploads/file",
      successBody: "",
      successPayload: '{"success":true, "attachments": [{"id": 3, "url":"link1"},{"id": 4, "url":"link2"}]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Some error message"}'
        }
      ],
      needToken: true
    }
  ];
};
