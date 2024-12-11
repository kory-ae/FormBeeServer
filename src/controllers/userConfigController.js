import { supabase } from '../config/supabase.js';
import { getAccountTypeName, isValidAccountType } from '../constants/accountTypes.js';

export const updateUserConfig = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { account_type, jotform_key } = req.body;

    // First, verify the user exists in auth.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or insert user configuration
    const { data, error } = await supabase
      .from('user_configs')
      .upsert({
        user_id,
        account_type,
        jotform_key,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        returning: true
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'User configuration updated successfully',
      config: {
        account_type: data[0].account_type,
        account_type_name: getAccountTypeName(data[0].account_type),
        // Don't send the full JotForm key back in the response for security
        jotform_key_set: !!data[0].jotform_key
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserConfig = async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('user_configs')
      .select('account_type, created_at, updated_at')
      .eq('user_id', user_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User configuration not found' });
    }

    return res.status(200).json({
      config: {
        ...data,
        account_type_name: getAccountTypeName(data.account_type)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};