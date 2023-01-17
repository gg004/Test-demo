const path = require("path");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { createDirectoriesRecursive } = require("./UtilService");
const config = require("../config");

module.exports = {
  upload: function (location) {
    if (config.upload_type === "s3") {
      return this.s3_upload(location);
    } else {
      return this.local_upload();
    }
  },
  s3_upload: function (location) {
    try {
      // aws.config.update({
      //   accessKeyId: config.aws_key,
      //   secretAccessKey: config.aws_secret,
      //   //        region: config.aws_region,
      // });

      const s3 = new aws.S3({
        accessKeyId: config.aws_key,
        secretAccessKey: config.aws_secret,
      });

      const upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: config.aws_bucket,
          acl: "public-read",
          contentType: multerS3.AUTO_CONTENT_TYPE,
          key: function (req, file, cb) {
            cb(null, file.originalname);
          },
        }),
      });

      return upload;
    } catch (error) {
      console.log("s3_upload => ", error);
    }
  },
  local_upload: function () {
    try {
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          createDirectoriesRecursive(path.join(__dirname, "..", "public", "uploads"));
          cb(null, path.join(__dirname, "..", "public", "uploads"));
        },
        filename: function (req, file, cb) {
          const fileName = file.filename ?? file.originalname.replace(/\s+/g, "").trim();
          cb(null, Date.now() + "-" + fileName);
        },
      });

      const upload = multer({ storage: storage });

      return upload;
    } catch (error) {
      console.log("local_upload => ", error);
    }
  },
};
