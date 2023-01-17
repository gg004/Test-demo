const PasswordService = require("../services/PasswordService");

module.exports = {
  async user(data) {
    if (data.password) {
      let service = new PasswordService();
      const hashPassword = await service.hash(data.password);
      data.password = hashPassword;
    }
    return data;
  }
};