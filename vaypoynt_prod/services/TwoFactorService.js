const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

module.exports = {
  getTwoFactorAuthenticationCode: async function (projectId) {
    const secretCode = speakeasy.generateSecret({
      name: projectId
    });

    const img = await QRCode.toDataURL(secretCode.otpauth_url);
    return {
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
      ascii_code: secretCode.ascii,
      img: img
    };
  },

  getDataURL: async function (otpauth_url) {
    const img = await QRCode.toDataURL(otpauth_url);
    return img;
  },
  verifyOtp: function (ascii_code, token) {
    return speakeasy.totp.verify({
      secret: ascii_code,
      encoding: "ascii",
      token: token
    });
  }
};
