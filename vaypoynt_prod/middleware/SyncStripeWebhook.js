const config = require("./../config");
const StripeService = new (require("./../services/StripeService"))();
const required_events = [
  "checkout.session.async_payment_failed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.completed",
  "checkout.session.expired",
  "customer.bank_account.created",
  "customer.bank_account.deleted",
  "customer.bank_account.updated",
  "customer.card.created",
  "customer.card.deleted",
  "customer.card.updated",
  "customer.created",
  "customer.deleted",
  "customer.discount.created",
  "customer.discount.deleted",
  "customer.discount.updated",
  "customer.source.created",
  "customer.source.deleted",
  "customer.source.expiring",
  "customer.source.updated",
  "customer.subscription.created",
  "customer.subscription.deleted",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "customer.subscription.updated",
  "customer.tax_id.created",
  "customer.tax_id.deleted",
  "customer.tax_id.updated",
  "customer.updated",
  "payment_intent.amount_capturable_updated",
  "payment_intent.canceled",
  "payment_intent.created",
  "payment_intent.partially_funded",
  "payment_intent.payment_failed",
  "payment_intent.processing",
  "payment_intent.requires_action",
  "payment_intent.succeeded",
  "invoice.created",
  "invoice.deleted",
  "invoice.finalization_failed",
  "invoice.finalized",
  "invoice.marked_uncollectible",
  "invoice.paid",
  "invoice.payment_action_required",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
  "invoice.sent",
  "invoice.upcoming",
  "invoice.updated",
  "invoice.voided"
];

module.exports = async function (req, res, next) {
  let base_url = config.base_url ?? "https://mkdlabs.com";

  if (config.system === "local") {
    base_url = process.env.NGROK_URL ? process.env.NGROK_URL : "https://mkdlabs.com";
  }

  const webhook_url_should_be = `${base_url}/v2/api/lambda/stripe/baas/webhook`;
  try {
    const project_setup_webhook_before = await StripeService.getAllWebhooks().then((list) =>
      list.find((webhook) => webhook.url.split("/").findIndex((part) => part === "baas") !== -1)
    );

    if (!project_setup_webhook_before) {
      await StripeService.createWebhookEndpoint({ url: webhook_url_should_be, events: required_events });
      return next();
    }

    const does_it_match_system =
      project_setup_webhook_before.url === webhook_url_should_be && project_setup_webhook_before.enabled_events.toString() === required_events.toString();
    if (!does_it_match_system) {
      await StripeService.updateWebhookEndpoint({
        id: project_setup_webhook_before.id,
        url: webhook_url_should_be,
        events: required_events
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: true, code: 401, message: "Something went wrong" });
  }
};
