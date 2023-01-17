var fs = require("fs");

module.exports = function (app) {
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file === "index.js" || file==="delete_company_data.js" || file.substr(file.lastIndexOf(".") + 1) !== "js") {
      console.log('is directory', file);
      return;
    }

    var name = file.substr(0, file.indexOf("."));
    require("./" + name)(app);
  });
}