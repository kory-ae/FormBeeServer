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