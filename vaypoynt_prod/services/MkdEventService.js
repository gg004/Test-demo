const ValidationService = require("./ValidationService");
const axios = require("axios");
const config = require("../config");
const MailService = require("./MailService");
const StripeService = require("./StripeService");
const stripe = new StripeService();
const { sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");

module.exports = class MkdEventService {
  constructor(sdk, projectId, header) {
    this._sdk = sdk;
    this._header = header;
    this._sdk.setProjectId(projectId);
  }

  async sendMail(payload, template = "") {
    try {
      if (template === "") {
        MailService.initialize(config);
        return await MailService.send(payload.from, payload.to, payload.subject, payload.body);
      } else {
        this._sdk.setTable("email");
        const email = await this._sdk.get({
          slug: template
        });
        if (typeof email !== "string") {
          let mailSubject = email[0].subject;
          let mailBody = email[0].html;

          for (let key in payload) {
            mailSubject = mailSubject.replace(new RegExp("{{{" + key + "}}}", "g"), payload[key]);
            mailBody = mailBody.replace(new RegExp("{{{" + key + "}}}", "g"), payload[key]);
          }

          MailService.initialize(config);

          return await MailService.send(payload.from, payload.to, mailSubject, mailBody);
        }
      }
    } catch (e) {
      console.error("Mail Error:", e);
      throw Error("Mail Error");
    }
  }

  filterFields(payload, keys) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!Object.hasOwnProperty.call(payload, key)) delete payload[key];
    }
    return payload;
  }
};
