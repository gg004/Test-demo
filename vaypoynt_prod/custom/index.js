var fs = require("fs");

module.exports = function (app) {
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file === "index.js") {
      return;
    }
    if (file === ".DS_Store") {
      return;
    }

    if (file.substr(file.lastIndexOf(".") + 1) !== "js") {
      require("./" + file + "/index.js")(app);
      return;
    }

    var name = file.substr(0, file.indexOf("."));
    require("./" + name)(app);
  });
}