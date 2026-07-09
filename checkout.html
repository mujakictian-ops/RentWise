// api/create-checkout-session.js
// Vercel Serverless Function — POST /api/create-checkout-session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, userEmail, userId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail || undefined,

      line_items: [{ price: priceId, quantity: 1 }],

      // 14-day free trial
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: userId || '' },
      },

      success_url: `${process.env.APP_URL}/rentwise-dashboard.html?checkout=success`,
      cancel_url: `${process.env.APP_URL}/rentwise-register.html?checkout=canceled`,

      metadata: { userId: userId || '' },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
