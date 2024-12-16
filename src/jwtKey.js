import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://eciirqwvjhbjdsvigpeq.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY;

//console.log('key: ' + supabaseKey);


const email = 'kory.karr@gmail.com';
const password = 's2CNgWJHU604BJAW9WvS';
const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });



if (error){
    console.log("\r\n\r\nError!!!");
    console.log(error + "\r\n\r\n");
}
else {
    console.log('user: ' + data.user );
    console.log('token: ' + data.session.access_token );
}
