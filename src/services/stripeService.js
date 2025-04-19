import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({path: process.env.ENV_FILE || '.env'});

const stripeAPIKey = process.env.STRIPE_API_KEY;
const supabaseAnonKey = process.env.SUPABASE_SVC_KEY;

if (!stripeAPIKey) {
  throw new Error('Missing Stripe credentials');
}

export const stripe = new Stripe(stripeAPIKey);
