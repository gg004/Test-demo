let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let cors = require("cors");
let indexRouter = require("./baas/index");
let lambdaRouter = require("./lambda/index");
let customRouter = require("./custom/index");
const body_parser = require("body-parser");
let eta = require("eta");
let app = express();
const fs = require("fs");
let BackendSDK = require("./core/BackendSDK");
let config = require("./config");
let sdk = new BackendSDK();
const RedisService = require("./services/RedisService");
const helmet = require("helmet");

sdk.setDatabase(config);

// (async function (app) {
//   let subRedisService = new RedisService();
//   let subscriber = await subRedisService.getClient();
//   let pubRedisService = new RedisService();
//   let publisher = await pubRedisService.getClient();
//   app.set("subscriber", subscriber);
//   app.set("publisher", publisher);
// })(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine("eta", eta.renderFile);
app.set("view engine", "eta");
app.set("sdk", sdk);
app.enable("trust proxy");
//app.use(helmet());
app.use(cors());
app.options("*", cors());
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "https://*.google.com",
//           "https://*.google-analytics.com",
//           "https://*.googletagmanager.com",
//           "https://mkdlabs.com",
//         ],
//         connectSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "https://*.google.com",
//           "https://*.google-analytics.com",
//           "https://*.googletagmanager.com",
//           "https://mkdlabs.com",
//         ],
//         imgSrc: [
//           `'self'`,
//           `data:`,
//           `*.domain.nl`,
//           `*.amazonaws.com`,
//           `https://mkdlabs.com/`,
//           `https://mkdlabs.com/*`,
//         ],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   })
// );
app.use(body_parser.json({ limit: "500mb" }));
app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "../admin/dist")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
// app.use(express.static(path.join(__dirname)));

app.get("/home", function (req, res, next) {
  return res.sendFile(path.join(__dirname, "home_page/index.html"));
});
app.get("/", function (req, res) {
  return res.redirect("/home");
});
app.use("/v1/api/", indexRouter);

lambdaRouter(app);
customRouter(app);

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
// });

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
