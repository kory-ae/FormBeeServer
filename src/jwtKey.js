import { createClient } from '@supabase/supabase-js'
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://eciirqwvjhbjdsvigpeq.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const codeData = JSON.parse(fs.readFileSync('./codes.json', 'utf8'));
const userKey = process.argv.slice(2)[0];

const email = codeData[userKey].email;
const password = codeData[userKey].code
const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });


console.log(`\r\n\r\nKey: ${userKey}`)
console.log(`email: ${codeData[userKey].email}`)
console.log(`pwd: ${codeData[userKey].code}\r\n\r\n`)

if (error){
    console.log("Error!!!");
    console.log(error + "\r\n\r\n");
}
else {
    console.log('token: ' + data.session.access_token );
}