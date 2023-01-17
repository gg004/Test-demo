const Stripe = require("stripe");
const config = require("../config");
const { filterEmptyFields } = require("./UtilService");
const stripeSecret = config.stripe.secret_key;
/**
 * stripe service
 */
module.exports = class StripeService {
  stripe;
  constructor() {
    this.stripe = Stripe(stripeSecret);
  }
  getConfig() {
    return config?.stripe ?? {};
  }
  async createStripeCardToken(payload) {
    const { card_number, exp_month, exp_year, cvc } = payload;
    const token = await this.stripe.tokens.create({
      card: {
        number: card_number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc
      }
    });
    return token;
  }
  async createStripeCustomer(payload) {
    const { tokenId, email, metadata } = payload;
    const customer = await this.stripe.customers.create(
      filterEmptyFields({
        email: email,
        source: tokenId,
        metadata
      })
    );
    return customer;
  }
  async createStripeCustomerWithCard(payload) {
    const { tokenId, email, metadata } = payload;
    const customer = await this.stripe.customers.create({
      email: email,
      source: tokenId,
      metadata
    });

    return customer;
  }
  async setDefaultCard(payload) {
    const { customer_id, card_id } = payload;
    const card = await this.stripe.customers.update(customer_id, {
      default_source: card_id
    });
    return card;
  }

  async retrieveStripeCustomer(payload) {
    const { customerId } = payload;
    const customer = await this.stripe.customers.retrieve(customerId, {
      expand: ["sources"]
    });
    return customer;
  }
  async retrieveStripeCustomerCardDetails(payload) {
    const { customerId, cardId } = payload;
    const card = await this.stripe.customers.retrieveSource(customerId, cardId);
    return card;
  }
  async retrieveStripeCustomerAllCards(payload) {
    const { customerId, after, before, limit } = payload;
    const cards = await this.stripe.customers.listSources(
      customerId,
      filterEmptyFields({
        object: "card",
        limit,
        starting_after: after,
        ending_before: before,
        expand: ["data.customer"]
      })
    );

    return cards;
  }
  async addNewCardToStripeCustomer(payload) {
    const { tokenId, customerId, metadata } = payload;
    const card = await this.stripe.customers.createSource(customerId, {
      source: tokenId,
      metadata
    });
    return card;
  }
  async stripeCharge(payload) {
    const { amount, currency, customer_id, token_id, description } = payload;
    const charge = await this.stripe.charges.create({
      amount: amount * 100,
      currency: currency,
      customer: customer_id,
      source: token_id,
      description: description ?? new Date().toISOString()
    });
    return charge;
  }
  async retrieveStripeCharge(payload) {
    const { chargeId } = payload;
    const charge = await this.stripe.charges.retrieve(chargeId);
    return charge;
  }
  async retrieveStripeChargeAll(payload) {
    const { customer_id } = payload;
    const charges = await this.stripe.charges.list({
      customer: customer_id
    });
    return charges;
  }
  async deleteStripeCustomerCard(payload) {
    const { customerId, cardId } = payload;
    const card = await this.stripe.customers.deleteSource(customerId, cardId);
    return card;
  }
  async deleteStripeCustomer(payload) {
    const { customerId } = payload;
    const customer = await this.stripe.customers.delete(customerId);
    return customer;
  }
  async createStripeProduct(payload) {
    const {
      name,
      description,
      metadata
      // active = true,
      // default_price_data,
      // images,
      // url,
    } = payload;
    const product = await this.stripe.products.create(
      filterEmptyFields({
        name,
        description,
        metadata
      })
    );
    return product;
  }

  async retrieveStripeProducts(payload) {
    const { limit, ids, starting_after, ending_before } = payload;

    const products = await this.stripe.products.list(filterEmptyFields(limit, ids, starting_after, ending_before));
    return products;
  }

  async retrieveStripeProduct(payload) {
    const { product_id } = payload;
    const product = await this.stripe.products.retrieve(product_id);
    return product;
  }

  async deleteStripeProduct(payload) {
    const { productId } = payload;
    const product = await this.stripe.products.delete(productId);
    return product;
  }

  async createStripeOnetimePrice(payload) {
    const { productId, name, amount, currency, metadata } = payload;
    const params = {
      product: productId,
      unit_amount: +amount * 100,
      nickname: name,
      currency: currency,
      metadata
    };
    const price = await this.stripe.prices.create(filterEmptyFields(params));
    return price;
  }

  async createStripeRecurringPrice(payload) {
    const { productId, name, amount, currency, interval, interval_count = 1, trial_days, metadata } = payload;
    const params = {
      product: productId,
      unit_amount: +amount * 100,
      nickname: name,
      currency: currency,
      recurring: {
        interval,
        interval_count: +interval_count,
        trial_period_days: +trial_days
      },
      metadata
    };
    if (interval === "lifetime") {
      delete params.recurring;
      params.metadata = {
        is_lifetime_subscription: "true"
      };
    }
    const price = await this.stripe.prices.create(filterEmptyFields(params));
    return price;
  }

  async createStripeRecurringMeteredPrice(payload) {
    const { productId, name, amount, currency, usage_limit, interval, interval_count = 1, trial_days, metadata } = payload;

    const params = {
      product: productId,
      unit_amount: +amount * 100,
      nickname: name,
      currency: currency,
      recurring: {
        interval,
        interval_count: +interval_count,
        trial_period_days: +trial_days,
        usage_type: "metered",
        aggregate_usage: "sum"
      },
      metadata: { ...metadata, usage_limit: +usage_limit }
    };

    if (interval === "lifetime") {
      delete params.recurring;
      delete params.metadata.usage_limit;
      params.metadata.is_lifetime_subscription = "true";
    }
    const price = await this.stripe.prices.create(filterEmptyFields(params));
    return price;
  }

  async retrieveStripePrice(payload) {
    const { priceId } = payload;
    const price = await this.stripe.prices.retrieve(priceId);
    return price;
  }

  async updateStripeProduct(product_id, payload) {
    const { name, description, active } = payload;

    const product = await this.stripe.products.update(
      product_id,
      filterEmptyFields(
        {
          name,
          description,
          active
        },
        true
      )
    );
    return product;
  }
  async updateStripePrice(payload) {
    const { price_id, name, status } = payload;
    const plan = await this.stripe.prices.update(
      price_id,
      filterEmptyFields(
        {
          nickname: name,
          active: status
        },
        true
      )
    );
    return plan;
  }
  async deactivateStripePrice(payload) {
    const { price_id } = payload;
    return await this.stripe.prices.update(price_id, { active: false });
  }
  async retrieveStripePriceAll(payload) {
    const { product_id } = payload;
    const prices = await this.stripe.prices.list({
      product: product_id
    });
    return prices;
  }
  async createStripeCoupon(payload) {
    const { name, percent_off, duration, duration_in_months, currency } = payload;
    const coupon = await this.stripe.coupons.create({
      name: name,
      percent_off: percent_off,
      duration: duration,
      duration_in_months: duration_in_months,
      currency: currency
    });
    return coupon;
  }
  async retrieveStripeCoupon(payload) {
    const { couponId } = payload;
    const coupon = await this.stripe.coupons.retrieve(couponId);
    return coupon;
  }
  async deleteStripeCoupon(payload) {
    const { couponId } = payload;
    const coupon = await this.stripe.coupons.delete(couponId);
    return coupon;
  }
  async retrieveStripeCouponAll(payload) {
    const coupons = await this.stripe.coupons.list();
    return coupons;
  }
  async createStripeSubscription(payload) {
    const { customerId, priceId, coupon = null, default_payment_method, trial_from_plan = false, metadata } = payload;
    const subscription = await this.stripe.subscriptions.create(
      filterEmptyFields({
        customer: customerId,
        items: [{ price: priceId }],
        coupon: coupon,
        payment_behavior: "error_if_incomplete",
        default_payment_method,
        trial_from_plan,
        metadata
      })
    );
    return subscription;
  }
  async reactivateStripeSubscription(payload) {
    const { subscriptionId } = payload;
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      collection_method: "charge_automatically"
    });
    return subscription;
  }
  async changeStripeSubscriptionPlan(payload) {
    const { subscriptionId, subItemId, newPriceId } = payload;
    const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subItemId,
          price: newPriceId
        }
      ]
    });
    return updatedSubscription;
  }
  async updateStripeSubscription(payload) {
    const { subscriptionId, priceId, proration } = payload;
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      proration_behavior: proration ? proration : "create_prorations",
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId
        }
      ]
    });
    return updatedSubscription;
  }
  async updateStripeSubscriptionAnchor(payload) {
    const { subscriptionId, priceId, proration } = payload;
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    // const deleted = await this.stripe.subscriptionItems.del(
    //   subscription.items.data[0].id
    // );
    // const updatedSubscription = await this.stripe.subscriptionItems.create({
    //   subscription: subscriptionId,
    //   price: priceId,
    //   quantity: quantity ? quantity : 1,
    // });
    console.log(subscription, 'sub price' ,priceId)
    const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      billing_cycle_anchor: "now",
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId
        }
      ]
    });
    return updatedSubscription;
  }

  async createUsageCharge(payload) {
    const { subItemId, quantity } = payload;
    const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(subItemId, { quantity: quantity, timestamp: "now" });
    return usageRecord;
  }
  async updateSubscriptionItem(payload) {
    const { id, params } = payload;
    const usageRecord = await this.stripe.subscriptionItems.update(id, params);
    return usageRecord;
  }

  async cancelStripeSubscription(payload) {
    const { subscriptionId } = payload;
    const subscription = await this.stripe.subscriptions.del(subscriptionId);
    return subscription;
  }

  async cancelStripeSubscriptionAtPeriodEnd(payload) {
    const { subscriptionId } = payload;
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      collection_method: "send_invoice"
    });
    return subscription;
  }

  async listStripeSubscription(payload) {
    const subscriptions = await this.stripe.subscriptions.list(payload);
    return subscriptions;
  }
  async retrieveStripeSubscription(payload) {
    const { subscriptionId } = payload;
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  }
  async createStripeRefund(payload) {
    const { customer_stripe_id, user_id, charge_id, amount, reason } = payload;
    const refund = await this.stripe.refunds.create({
      charge: charge_id,
      amount: amount,
      metadata: {
        user_id: user_id,
        customer_stripe_id: customer_stripe_id
      },
      reason: reason ? reason : null
    });
    return refund;
  }
  async retrieveStripeRefund(payload) {
    const { refund_id } = payload;
    const refund = await this.stripe.refunds.retrieve(refund_id);
    return refund;
  }
  async cancelStripeRefund(payload) {
    const { refund_id } = payload;
    const refund = await this.stripe.refunds.cancel(refund_id);
    return refund;
  }
  async retrieveStripeRefundAll(payload) {
    const { chargeId } = payload;
    const refunds = await this.stripe.refunds.list({
      charge: chargeId
    });
    return refunds;
  }
  async createStripeDispute(payload) {
    const { charge_id, reason, reason_description } = payload;
    const dispute = await this.stripe.issuing.disputes.create({
      transaction: charge_id,
      evidence: {
        reason: reason,
        [reason]: {
          expected_at: reason_description.expected_at ?? null,
          explanation: reason_description.explanation ?? null,
          product_description: reason_description.product_description ?? null,
          product_type: reason_description.product_type ?? null
        }
      }
    });
    return dispute;
  }
  async submitStripeDispute(payload) {
    const { dispute_id } = payload;
    const dispute = await this.stripe.issuing.disputes.submit(dispute_id);
    return dispute;
  }
  async retrieveStripeDispute(payload) {
    const { dispute_id } = payload;
    const dispute = await this.stripe.disputes.retrieve(dispute_id);
    return dispute;
  }
  async updateStripeDispute(payload) {
    const { dispute_id, reason, reason_description } = payload;
    const dispute = await this.stripe.issuing.disputes.update(dispute_id, {
      evidence: {
        reason: reason,
        [reason]: {
          expected_at: reason_description.expected_at ?? null,
          explanation: reason_description.explanation ?? null,
          product_description: reason_description.product_description ?? null,
          product_type: reason_description.product_type ?? null
        }
      }
    });
    return dispute;
  }
  async closeStripeDispute(payload) {
    const { dispute_id } = payload;
    const dispute = await this.stripe.disputes.close(dispute_id);
    return dispute;
  }

  async retrieveCustomerInvoices(payload) {
    const { customerId, limit, after, before } = payload;
    const invoices = await this.stripe.invoices.list(
      filterEmptyFields({
        customer: customerId,
        limit,
        starting_after: after,
        ending_before: before
      })
    );
    return invoices;
  }
  async createPaymentIntentAutomatic(payload){
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: payload.amount,
      currency: payload.currency ? payload.currency : 'usd',
      automatic_payment_methods: {enabled:true},
    });
    return paymentIntent;
  }
  async createPaymentIntentManual(payload){
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: payload.amount,
      currency: payload.currency ? payload.currency : 'usd',
      payment_method_types: payload.payment_method_types
    });
    return paymentIntent;
  }

  async updatePaymentIntent(payload){
    const paymentIntentId = payload.paymentIntentId;
    delete payload.paymentIntentId;
    const updatedIntent = await this.stripe.paymentIntents.update(
      paymentIntentId,
      ...payload
    );
    return updatedIntent;
  }
  async retrievePaymentIntent(payload){
    const paymentIntentId = payload
    const intents = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return intents;
  }

  async listShippingMethods(payload={}){
    const shippingRates = await this.stripe.shippingRates.list({
      limit: payload.limit ? payload.limit : 3,
    });
    return shippingRates;
  }
  async createShippingMethod(payload){
    const shippingRate = await this.stripe.shippingRates.create({
      display_name: payload.display_name,
      type: payload.type ? payload.type : 'fixed_amount',
      fixed_amount: {amount: payload.amount, currency: payload.currency ? payload.currency : 'usd'},
    });
    return shippingRate;
  }
  async deactivateShippingMethod(payload){
    const shippingRate = await this.stripe.shippingRates.update(
      payload.shippingRateId,
      {
        active: false
      }
    );
    return shippingRate;
  }
  async updateShippingMethod(payload){
    const shippingRate = await this.stripe.shippingRates.update(
      payload
    );
    return shippingRate;
  }


  async retrieveCustomerCharges(payload) {
    const { customerId, limit, after, before } = payload;
    const invoices = await this.stripe.charges.list(
      filterEmptyFields({
        customer: customerId,
        limit,
        starting_after: after,
        ending_before: before
      })
    );
    return invoices;
  }

  async createWebhookEndpoint(payload) {
    const { url, events } = payload;
    const webhookEndpoint = await this.stripe.webhookEndpoints.create({
      url: url,
      enabled_events: events
    });
    return webhookEndpoint;
  }

  async updateWebhookEndpoint(payload) {
    const { url, events, metadata, id } = payload;
    const webhookEndpoint = await this.stripe.webhookEndpoints.update(id, {
      url: url,
      enabled_events: events,
      metadata
    });
    return webhookEndpoint;
  }

  async deleteWebhookEndpoint(payload) {
    const { id } = payload;
    const webhookEndpoint = await this.stripe.webhookEndpoints.del(id);
    return webhookEndpoint;
  }

  async getAllWebhooks() {
    const webhooks = [];
    for await (const webhook of this.stripe.webhookEndpoints.list({ limit: 100 })) {
      webhooks.push(webhook);
    }
    return webhooks;
  }
  async createCheckoutSession(payload) {
    // const { success_url, mode, cancel_url, customer, customer_email, payment_method_types, payment_intent_data, metadata, line_items } = payload;
    const checkout = await this.stripe.checkout.sessions.create(filterEmptyFields(payload));
    return checkout;
  }
};
