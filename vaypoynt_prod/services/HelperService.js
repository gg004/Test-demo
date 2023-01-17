module.exports = class HelperService {
  constructor(sdk, projectId) {
    this._sdk = sdk;
    this._sdk.setProjectId(projectId);
  }

  async getUserByStripeUid(stripe_uid) {
    this._sdk.setTable("user");
    let result = await this._sdk.get({
      stripe_uid: stripe_uid,
    });
    if (result.length != 1) {
      return null;
    }
    return result[0];
  }
  async getSubscriptionByStripeId(stripe_id) {
    this._sdk.setTable("stripe_subscription");
    let result = await this._sdk.get({
      stripe_id: stripe_id,
    });
    if (result.length != 1) {
      return null;
    }
    return result[0];
  }
}
