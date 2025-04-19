import { stripe } from '../services/stripeService.js'
import logger from '../config/logger.js';

export const subscribe = async (req, res) => {
  try {
    
    const priceId = process.env.STRIPE_SUBSCRIBE_PRICE_ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url:  `${process.env.CLIENT_HOST}/subscribe?result=success`,
      cancel_url: `${process.env.CLIENT_HOST}/subscribe?result=cancel`
    });
    
    res.json({ id: session.id });
  } catch (error) {
    logger.error("Error while creating stripe subscription:")
    logger.error(error.message)
    res.status(500).json({ error: 'something went wrong' });
  }
}

export const unsubscribe = async (req, res) => {
  try {
    const subscriptionId = req.query.subscriptionId
    await stripe.subscriptions.cancel(subscriptionId);
    res.status(200).json({message: "ok"})
  } catch (err) {
    logger.error('Error while unsubscribing');
    logger.error(err);
    res.status(500).send(`Error while unsubscribing: ${err.message}`);
  }
}

export const stripeWebhook = (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    logger.debug("Constructing event")
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    logger.info('Webhook received:' + event.type);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}


export const getCustomerDetails = async (req, res) => {
  
}

export const getPaymentDetails = async (req, res) => {
  try {
    const customer = req.query.customer
    //const paymentMethod = req.params.paymentMethod
    const paymentDetails = await stripe.customers.listPaymentMethods(customer);
    return res.status(200).json(paymentDetails.data[0])
  } catch (error) {
    logger.error("Error while getting payment details:")
    logger.error(error.message)
    res.status(500).json({ error: 'something went wrong' });
  }
}

export const getInvoiceList = async (req, res) => {
  try {
    const customer = req.query.customer
    
    const invoiceList =  await stripe.invoices.list({
      customer: customer
    });
    
    return res.status(200).json(invoiceList.data)
  } catch (error) {
    logger.error("Error while getting invoice list:")
    logger.error(error.message)
    res.status(500).json({ error: 'something went wrong' });
  }
}

export const changePaymentDetails = async (req, res) => {
  try {
    const customer = req.query.customer;
    
    // Create a setup session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customer,
      
      success_url: `${process.env.CLIENT_HOST}/subscribe?paymentUpdate=success`,
      cancel_url: `${process.env.CLIENT_HOST}/subscribe?paymentUpdate=cancel`,
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
  
