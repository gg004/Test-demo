// const StripeService = require("./StripeService");
const stripe = new (require("./StripeService"))();
const { sqlDateFormat, sqlDateTimeFormat } = require("./UtilService");
function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
async function findCustomer({ customerId, sdk }, retries = 0) {
  sdk.setTable("user");
  const customerExists = await sdk.get({ stripe_uid: customerId });
  if (!customerExists[0]) {
    if (retries > 2) {
      return false;
    }
    console.log("waiting");
    await sleep(20);
    return await findCustomer({ customerId, sdk }, retries++);
  }
  return customerExists;
}

async function findSubscription({ subscriptionId, sdk }, retries = 0) {
  sdk.setTable("stripe_subscription");
  const subExists = await sdk.get({ stripe_id: subscriptionId });
  if (!subExists[0]) {
    if (retries > 2) {
      return false;
    }
    console.log("waiting");
    await sleep(5);
    return await findSubscription({ subscriptionId, sdk }, retries++);
  }
  return subExists;
}

async function webhookHandledBefore({ sdk, event }) {
  sdk.setTable("stripe_webhook");
  const webhookHandledBefore = await sdk.get({ is_handled: true, stripe_id: event.id, event_type: event.type });
  if (webhookHandledBefore[0]) {
    return true;
  }
  return false;
}

async function saveWebhook({ sdk, event }) {
  sdk.setTable("stripe_webhook");
  await sdk.insert({
    stripe_id: event.id,
    description: event.data.object.object,
    event_type: event.type,
    resource_type: event.type,
    object: JSON.stringify(event.data.object),
    is_handled: true,
    create_at: sqlDateFormat(new Date()),
    update_at: sqlDateTimeFormat(new Date()),
  });
}

exports.handleCheckoutSessionCompleted = async ({ sdk, event }) => {
  /**
   * get the customer from db by the email,
   * check if the customer is new add the stripe id to their record
   * save the checkout
   * save the webhook
   */
  const checkout = event.data.object;
  const projectId = checkout.metadata.projectId;
  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);
  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";

  sdk.setTable("user");
  const customer = await sdk.getStr([`stripe_uid = "${checkout.customer}" OR email = "${checkout.customer_email}" `]); // OR id = ${checkout.client_reference_id}
  if (!customer[0]) {
    return "No customer was found with this email or id";
  }
  if (!customer[0].stripe_uid || customer[0].stripe_uid !== checkout.customer) await sdk.update({ stripe_uid: checkout.customer }, customer[0].id);
  sdk.setTable("stripe_checkout");
  await sdk.insert({
    stripe_id: checkout.id,
    user_id: customer[0].id,
    object: JSON.stringify(checkout),
    create_at: sqlDateFormat(new Date()),
    update_at: sqlDateTimeFormat(new Date()),
  });
  await saveWebhook({ sdk, event });
  return "Checkout registered and customer updated";
};

exports.handleSubscriptionCreated = async ({ sdk, event }) => {
  /**
   * get the customer id -> find it in system if it fails first time wait for a minute and search again -> if found get his id -> save the subscription for him in system
   * get the plan by its stripe id -> if not found save it by stripe id for now
   */

  const subscription = event.data.object;
  const projectId = subscription.metadata.projectId;
  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);

  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";

  const customerId = subscription.customer;
  const allowRetries = 0;
  const customer = await findCustomer({ customerId, sdk }, allowRetries);

  if (!customer[0]) {
    return "Customer doesn't exist in the system";
  }

  sdk.setTable("stripe_price");
  const plan = await sdk.get({ stripe_id: subscription.plan.id });

  sdk.setTable("stripe_subscription");
  await sdk.insert({
    stripe_id: subscription.id,
    user_id: customer[0].id,
    price_id: plan[0]?.id || subscription.plan.id,
    status: subscription.status,
    object: JSON.stringify(subscription),
    create_at: sqlDateFormat(new Date()),
    update_at: sqlDateTimeFormat(new Date()),
  });

  await saveWebhook({ sdk, event });
  return "New subscription added successfully";
};

exports.handleSubscriptionUpdated = async ({ sdk, event }) => {
  const subscription = event.data.object;
  const projectId = subscription.metadata.projectId;
  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);

  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";
  const customerId = subscription.customer;
  const skipRetries = 3;
  const customer = await findCustomer({ customerId, sdk }, skipRetries);

  if (!customer[0]) {
    return "Customer doesn't exist in the system";
  }
  sdk.setTable("stripe_price");
  const plan = await sdk.get({ stripe_id: subscription.plan.id });

  sdk.setTable("stripe_subscription");
  const subscriptionExists = await sdk.get({ stripe_id: subscription.id });
  if (!subscriptionExists[0]) {
    await sdk.insert({
      stripe_id: subscription.id,
      user_id: customer[0].id,
      price_id: plan[0]?.id || subscription.plan.id,
      status: subscription.status,
      object: JSON.stringify(subscription),
      create_at: sqlDateFormat(new Date()),
      update_at: sqlDateTimeFormat(new Date()),
    });
  } else {
    await sdk.update(
      {
        price_id: plan[0]?.id || subscription.plan.id,
        object: JSON.stringify(subscription),
        status: subscription.status,
        update_at: sqlDateTimeFormat(new Date()),
      },
      subscriptionExists[0].id
    );
  }

  await saveWebhook({ sdk, event });
  return `Subscription of ${customer[0].email} is updated successfully`;
};

exports.handleSubscriptionDeleted = async ({ sdk, event }) => {
  const subscription = event.data.object;
  const projectId = subscription.metadata.projectId;
  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);

  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";
  sdk.setTable("stripe_subscription");
  const subscriptionExists = await sdk.get({ stripe_id: subscription.id });
  if (!subscriptionExists[0]) {
    return "Subscription doesn't exist in the system";
  }

  await sdk.update(
    {
      status: subscription.status,
      object: JSON.stringify(subscription),
      update_at: sqlDateTimeFormat(new Date()),
    },
    subscriptionExists[0].id
  );

  const customerId = subscription.customer;
  const skipRetries = 3;
  const customer = await findCustomer({ customerId, sdk }, skipRetries);

  if (!customer[0]) {
    return "Customer doesn't exist in the system";
  }

  await saveWebhook({ sdk, event });
  return `Subscription of ${customer[0].email} is deleted successfully`;
};

exports.handleSubscriptionTrialWillEnd = async ({ sdk, event }) => {
  const subscription = event.data.object;
  const projectId = subscription.metadata.projectId;

  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);
  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";
  await saveWebhook({ sdk, event });
  return "Done";
};

exports.handlePaymentSucceeded = async ({ sdk, event }) => {
  const payment = event.data.object;
  const projectId = payment.metadata.projectId;

  if (!projectId) {
    return `Missing project identifier`;
  }
  sdk.setProjectId(projectId);

  const webhookHandled = await webhookHandledBefore({ sdk, event });
  if (webhookHandled) return "Webhook handled before";
  const customerId = payment.customer;
  const planId = +payment.metadata.app_price_id;

  const allowRetries = 0;
  const customer = await findCustomer({ customerId, sdk }, allowRetries);
  if (!customer[0]) {
    return "Customer doesn't exist in the system";
  }

  if (payment.metadata.is_lifetime_subscription === "true") {
    /**
     * A lifetime subscription payment
     * save it as a subscription
     */

    sdk.setTable("stripe_subscription");
    await sdk.insert({
      stripe_id: payment.id,
      user_id: customer[0].id,
      price_id: planId,
      status: "active",
      is_lifetime: true,
      object: JSON.stringify(payment),
      create_at: sqlDateFormat(new Date()),
      update_at: sqlDateTimeFormat(new Date()),
    });

    return "New lifetime subscription added successfully";
  } else if (payment.metadata.is_order === "true") {
    sdk.setTable("stripe_order");
    await sdk.insert({
      stripe_id: payment.id,
      user_id: customer[0].id,
      price_id: planId,
      object: JSON.stringify(payment),
      create_at: sqlDateFormat(new Date()),
      update_at: sqlDateTimeFormat(new Date()),
    });
  }
  await saveWebhook({ sdk, event });

  return "Order saved successfully";
};

exports.handleInvocieCreated = async ({ sdk, event }) => {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  const billingReason = invoice.billing_reason;
  if (billingReason === "subscription_create") {
    const subscription = await stripe.retrieveStripeSubscription({ subscriptionId });
    const projectId = subscription.metadata.projectId;
    if (!projectId) {
      return `Missing project identifier`;
    }

    const webhookHandled = await webhookHandledBefore({ sdk, event });
    if (webhookHandled) return "Webhook handled before";
    const allowRetries = 0;
    const customer = await findCustomer({ customerId, sdk }, allowRetries);
    if (!customer[0]) {
      return "Customer doesn't exist in the system";
    }

    sdk.setTable("stripe_invoice");
    await sdk.insert({
      user_id: customer[0].id,
      stripe_id: invoice.id,
      object: JSON.stringify(invoice),
      create_at: sqlDateFormat(new Date()),
      update_at: sqlDateTimeFormat(new Date()),
    });

    await saveWebhook({ sdk, event });
    return "New invoice saved successfully";
  }
  return "New invoice is not subscription related, ignored for now";
};
