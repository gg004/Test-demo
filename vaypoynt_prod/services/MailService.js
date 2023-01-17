const nodemailer = require('nodemailer');

module.exports = {
  /** @private */
  transport: null,
  /** @private */
  from: null,
  /** @private */
  to: null,
  /**
   * Nodemailer initializer
   * @name mailService.initialize
   * @param {{hostname: String, port: Number, username: String, password: String, from: String, to: String}} config Nodemailer configuration
   * @returns {Void}
   */
  initialize: function (config) {
    this.transport = nodemailer.createTransport({
      host: config.mail_host,
      port: config.mail_port,
      auth: {
        user: config.mail_user,
        pass: config.mail_pass,
      },
    });

    this.from = config.from;
    this.to = config.to;
  },
  /**
   * Get email template from database
   * @name mailService.template
   * @param {String} slug email template slug
   * @reject {Error}
   * @returns {Promise.<{body: String, subject: String}>} email template
   */
  template: async function (slug, sdk) {
    try {
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("email");
      const result = await sdk.get({
        slug: slug,
      });
      if (typeof result == "string") {
        return {
          error: true,
          message: result,
        };
      }
      return {
        error: false,
        message: result[0]
      };
    } catch (error) {
      console.log("Template Error", error);
      return {
        error: true,
        message: error.message
      };
    }
  },
  /**
   * Inject values into email template
   * @name mailService.inject
   * @param {{body: String, subject: String}} template email template
   * @param {Object.<string, string>} payload template values
   * @returns {{from: String, to: String, subject: String, text: String}}  Value injected email template
   */
  inject: function (template, payload) {
    let mailBody = template.body;
    let mailSubject = template.subject;

    for (const key in payload) {
      const value = payload[key];
      mailBody = mailBody.replace(new RegExp('{{{' + key + '}}}', 'g'), value);
    }

    for (const key in payload) {
      const value = payload[key];
      mailSubject = mailSubject.replace(
        new RegExp('{{{' + key + '}}}', 'g'),
        value,
      );
    }

    return {
      from: this.from,
      to: this.to,
      subject: mailSubject,
      html: mailBody,
    };
  },
  /**
   * Send email
   * @name mailService.send
   * @param {nodemailer.SendMailOptions} template email template
   * @reject {Error} send mail error
   * @returns {Promise.<nodemailer.SentMessageInfo>} send mail info
   */
  send: async function (from, to, subject, html) {
    let self = this;
    try {
      const response = await self.transport.sendMail({
        from,
        to,
        subject,
        html,
        attachDataUrls: true,
      });
      return {
        error: false,
        message: response
      };
    } catch (error) {
      return {
        error: true,
        message: error.message
      };
    }
  }
};