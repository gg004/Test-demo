const config = require("../config");

const accountSid = config.TWILIO_SID;
const authToken = config.TWILIO_TOKEN;
const phoneNumber = config.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  from: phoneNumber,


  inject: function (template, payload) {
    let body = template.content;

    for (const key in payload) {
      const element = payload[key];
      body = body.replace(new RegExp("{{{" + key + "}}}", "g"), element);
    }

    return body;
  },

  /**
   * Send SMS
   * @param {string} to
   * @param {string} body
   */

  send: function (to, body) {
    let self = this;
    return new Promise(function (resolve, reject) {
      client.messages
        .create({
          body,
          from: self.from,
          to,
        })
        .then((message) => resolve(message.sid))
        .catch((error) => reject(error));
    });
  },
};
