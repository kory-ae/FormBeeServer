import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

export const createUser = async (req, res) => {
  try {
    const { email, password, account_type_id } = req.body;

    const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }
    
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type_id
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserConfig = async (req, res) => {

  try {
    const {account_type_id, jotform_key} = req.body;
    const updateObject = {};
    if (account_type_id){
      updateObject.account_type_id = account_type_id
    };
    if (jotform_key){
      updateObject.jotform_key = jotform_key
    };

    const {data, error} = await supabase
      .from("user_config")
      .update(updateObject)
      .eq('user_id', req.user.id )

      if (error) {
        throw error
      }  
    return res.status(200).json({"message": "ok"});
  } catch (error) {
    logger.error(`error while updating userConfig: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const getUserView = async (req, res) => {
  try {
      const {data, error} = await supabase
        .from('user_config')
        .select('account_type_id, jotform_key')
        .eq('user_id', req.user.id)
        .single()

        if (error) throw error

        const userView = {
          id: req.user.id,
          email: req.user.email,
          account_type_id: data.account_type_id,
          jotform_key: data.jotform_key
        }

    res.status(200).json({userView})

  } catch (error) {
    logger.error(`error while trying to get userView ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};