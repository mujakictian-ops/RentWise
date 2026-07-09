// api/webhook.js
// Vercel Serverless Function — POST /api/webhook
// Stripe → posodobi subscription_status v Supabase

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service_role key — NIKOLI v kodi/GitHubu
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;
  const obj = data.object;

  try {
    switch (type) {

      case 'checkout.session.completed': {
        const userId = obj.metadata?.userId;
        if (!userId) break;
        await supabase.from('profiles').update({
          stripe_customer_id: obj.customer,
          stripe_subscription_id: obj.subscription,
          subscription_status: 'trialing',
        }).eq('id', userId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const customerId = obj.customer;
        await supabase.from('profiles').update({
          subscription_status: 'active',
        }).eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const customerId = obj.customer;
        await supabase.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const customerId = obj.customer;
        await supabase.from('profiles').update({
          subscription_status: 'canceled',
        }).eq('stripe_customer_id', customerId);
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
