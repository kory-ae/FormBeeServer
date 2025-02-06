import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({path: process.env.ENV_FILE || '.env'});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SVC_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);