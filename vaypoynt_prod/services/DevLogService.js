const config = require("../config");

module.exports = class DevLogService {
  constructor() {
    this._allow_log = config && config.env && config.env == "development";
  }

  log(...data) {
    if (this._allow_log) {
      console.log(data);
    }
  }
};
