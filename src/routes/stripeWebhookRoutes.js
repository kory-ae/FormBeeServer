import express from 'express';
import { stripeWebhook } from '../controllers/paymentController.js';

const stripeWebhookRoutes = express.Router();


// endpoint: '/api/stripe/webhook', 
stripeWebhookRoutes.post('/', 
  express.raw({type: 'application/json'}),
  stripeWebhook
)

export default stripeWebhookRoutes;