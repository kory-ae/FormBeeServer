import { supabase } from '../config/supabase.js';

export const createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
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
      const userView = {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        isPaid: req.user.isPaid
      }
    res.status(200).json({userView})

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};