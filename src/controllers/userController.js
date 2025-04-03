import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { isPaid } from '../middleware/auth.js';
import { ACCOUNT_TYPES } from '../types/accountTypes.js';
import { queryFormGroups } from './formGroupController.js';

export const createUser = async (req, res) => {
  try {
    const { email, password, account_type_id } = req.body;

    const { data: existingUser, error: existError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email.toLowerCase())
   
    if (existError) throw existError

    if (existingUser.length == 1) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }
    
    let redirect = `${process.env.CLIENT_HOST}/login`
    const code = req.query.code;
    let codeData;
    if (code) {
      logger.debug(`user had code ${code}`)
      codeData = await getCodeData(code, null);
      if (codeData) {
        redirect = redirect + `?code=${code}`
      }
    }
    
    //redirect = "http://localhost:5173";
    //redirect = "https://form-bee-client-4e2cb24cb277.herokuapp.com/login";
    //redirect = "https://testing.dmaexdsc9ir2i.amplifyapp.com/login";

    logger.info(`redirect for login: ${redirect}`)

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirect,
        data: {
          account_type_id,
          redirect
        }
      }
    });

    if (error) {
      logger.error(`error after supabase signup: ${error}`)
      logger.error(error)
      return res.status(400).json({ error: error.message });
    }

    let codeAdded = false;
    if (codeData) {
      await linkUserFormGroup(codeData.id, user.id)
      codeAdded = true;
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name,
        codeAdded: codeAdded
      }
    });
  } catch (error) {
    logger.error("Error while creating user (probably while linking user form group)...")
    logger.error(error)
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

    if (error) throw error

    //return the new view.
    return await getUserView(req, res);
  } catch (error) {
    logger.error('error while updating userConfig:')
    logger.error(error)
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { error:fbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (fbError) throw fbError;

    const {error: sbError} =  await supabase
      .auth
      .admin
      .deleteUser(userId);

    if (sbError) throw sbError;

    return res.status(204).json();
  }
  catch (error) {
    logger.error("Error while deleting user", error)
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const getUserView = async (req, res) => {
  try {
    let userView;
    if (req.user.is_anonymous) {
      userView = {
        id: req.user.id,
        email: req.user.email,
        account_type_id: ACCOUNT_TYPES.ANON,
        isConfigured: true,
        isPaid: false,
        jotform_key: null
      }
    } else {
      const {data, error} = await supabase
      .from('user_config')
      .select('account_type_id, jotform_key')
      .eq('user_id', req.user.id)
      .single()

      userView = {
        id: req.user.id,
        email: req.user.email,
        account_type_id: data.account_type_id,
        isConfigured: data.account_type_id != ACCOUNT_TYPES.PAID || (data.account_type_id == ACCOUNT_TYPES.PAID && data.jotform_key != null),
        isPaid: data.account_type_id == ACCOUNT_TYPES.PAID,
        jotform_key: data.jotform_key
      }
    }
    res.status(200).json(userView)
  } catch (error) {
    logger.error(`error while trying to get userView ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function getCodeData(code, user_id) {
  
  let query = supabase
    .from('form_group')
    .select('id, user_id, parent_form_id, user_form_group(id)', )
    .eq('code', code)

  if (user_id) {
      query = query.eq('user_form_group.user_id', user_id)
  }

  const {data, error} = await query;

  if (error) throw error

  if (data.length !== 1) {
    if (data.length == 0) {
      return null;
    }
    else {
      throw new Error(`Unexpect duplicate codes! Code: ${code} count: ${data.length}`)
    }
  }
  else {
    return data[0];
  }
}

async function linkUserFormGroup(form_group_id, user_id) {

  const insertData = {
    form_group_id: form_group_id,
    user_id: user_id
  }

  const { data: insertResult, error: errorInsert } = await supabase
    .from("user_form_group")
    .insert(insertData);

  if (errorInsert) throw errorInsert;  
}

export const addUserFormGroup = async (req, res) => {
  try {
    let { code } = req.params;
    code = code.toUpperCase();

    const data = await getCodeData(code, req.user.id)    
    if(!data) {
      return res.status("400").json({message: "Code does not exist"});
    }

    if (data.user_form_group.length > 0 || data.user_id == req.user.id) {
      return res.status(200).json({message: "already there, or owner"});;
    }

    await linkUserFormGroup(data.id, req.user.id);

    return res.status(200).json({message: "added"});
  } catch (error) {
    logger.error(`error while trying to add user to FormGroup ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateCode = async (req, res) => {
  const data = await getCodeData(req.params.code, null)
  if (data == null) {
    return res.status(403).json({message: 'unknown code'})
  }
  return res.status(200).json(data);
}