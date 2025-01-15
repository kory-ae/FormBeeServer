import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
import { getForm, getForms, addSubmission } from '../services/jotAPIService.js';

export async function linkUserSubmission(submissionData) {
  try {
    // Insert the row and return the inserted data
    const { data, error } = await supabase
      .from("submission")
      .insert(submissionData)
      .select()

    if (error) {
      throw error
    }
    return data
  } catch (error) {
    logger.error('Error inserting submission row:', error.message)
    throw error
  }
}

async function getConfiguredFormsByUser (userId) {
  return await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
}

export const getFormOwner = async (formId) => {
  const {data, error} = await supabase
    .from("forms")
    .select("user_id")
    .eq("form_id", formId)   

  if (error) 
    throw error;

  return data[0].user_id;
}

async function updateNewFormUser() {
  
  const { data : newFormUser, error: error1 } = await supabase
    .from("form_user")
    .select("id,email")
    .is('user_id', null)

  if (error1) throw error1

  if (newFormUser.length == 0)
    return

  const {data: existingUsers, error: error2} = await supabase
    .from("users")
    .select("id,email")
    .filter(
      'email',
      'in',
      `(${newFormUser.map(x => x.email.toLowerCase())})`
    )
    //.in('email', )

  if (error1) throw error2

  if (existingUsers.length == 0)
    return

  const updateSet = newFormUser.reduce((acc, curr) =>{
      const foundUser = existingUsers.find(e => e.email.toLowerCase() == curr.email.toLowerCase() )
      if (foundUser) {
        curr.user_id = foundUser.id
        curr.email = null
        acc.push(curr)
      }
      return acc
  }, [])

  const {data: resultData, error: error3} = await supabase
    .from("form_user")
    .update(updateSet)
    .select('*')
    .in('id', updateSet.map(x => x.id))

  if (error3) throw error3

}

async function getConfiguredFormsByAssociation (user) {

  const { data : formList, error: error1 } = await supabase
    .from("form_user")
    .select("*")
    .or(`user_id.eq.${user.id},email.ilike.${user.email}`)

  if (error1) return {formList, error1};

  if (formList.some(x => x.email)){
    updateNewFormUser()
  }

  const {data, error} = await supabase
    .from("forms")
    .select("*")
    .in("form_id", formList.map(x => x.form_id))

  return {data, error};
}

export const deleteForm = async (req, res) => {
  try {
      const { formId } = req.params;
      
      const {data, error} = await supabase
        .from('forms')
        .delete()
        .eq('form_id', formId)

      return res.status(204);
    }
    catch (error) {
      logger.error(`error while deleting jot form: ${error}`)
      return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getJotFormSubmissions = async (req, res) => {
  try {
      const { formId } = req.params;
      const {includeDelete} = req.query.includeDelete === true;;
      const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(formId)
      let data = await getSubmissionByForm(userId, formId);
      if (!includeDelete){
        data = data.filter(submission => submission.status !== "DELETED")
      }
      if (!req.user.isPaid) {
        logger.info(`User is free user, filtering list to user's submissions`)
        const {data: submissionData, error } = await supabase
          .from("submission")
          .select("submission_id")
          .eq("user_id", req.user.id);
        
          if (error) throw error;

          const userSubmissions = submissionData.map( x=> x.submission_id);


        data = data.filter(submission => userSubmissions.includes(submission.id))
        
      }
      return res.status(200).json({forms: data});
    }
    catch (error) {
      logger.error(`error while getting jot all forms for user: ${error}`)
      return res.status(500).json({ error: 'Internal server error' });
    }
};

//refactor needed
export const getFormUsers = async (req, res) => {
  try {

    const {formId} = req.params;
    // Insert the row and return the inserted data
    const { data, error } = await supabase
      .from("form_user")
      .select("*")
      .eq("form_id", formId)
    
      if (error) throw error;

      const acctsNeedingEmail = data.reduce((acc, curr) => {
        if(!curr.email) {
          acc.push(curr.user_id)
        }
        return acc;
      }, [])

      if (acctsNeedingEmail.length > 0){
        const {data: userData, error: userError} = await supabase
         .from('users')
         .select('id, email')
         .in('id', acctsNeedingEmail)

         if (userError) throw userError

         userData.forEach(u => {
          const fData = data.find(f => f.user_id == u.id)
          fData.email = u.email;
         })
      }

    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error inserting submission row:', error.message)
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const addFormFromJot = async (req, res) => {

  try {
    const userId = req.user.id;
    const { jotFormId } = req.body;
    const jotFormData = await getForm(userId, jotFormId);

    const formBeeData = {
      form_id: jotFormData.id,
      title: jotFormData.title,
      user_id: userId
    }

    const { data, error } = await supabase
      .from('forms')
      .insert(formBeeData)
      .select()
      .single();

    if (error) {
      logger.error(`error while adding user to jot form: ${error}`);
      throw error;
    }
    return res.status(200).json({"message": "ok"});
  }
  catch (error)
  {
    if (error?.name == "AxiosError" && error.status === 401) {
      return res.status(401).json({ error: 'This request is not valid because of an internal \'unauthorized\' response'})
    }
    else {
      logger.error("Unable to get form from JotForm: " + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const getConfiguredForms = async (req, res) => {

  try {
    const userId = req.user.id;
    const { data, error } = (req.user.isPaid) ? await getConfiguredFormsByUser(userId) : await getConfiguredFormsByAssociation(req.user)
    if (error) {
      logger.error(`error while getting configured forms: ${error}`);
      throw error;
    }

    //Get jot forms to warn about removed forms
    const userIdList = [... new Set(data.map(x => x.user_id))]
    //await userIdList.forEach(async (user_id) => {
    for(const user_id of userIdList) {
      const jotForms = (await getForms(user_id)).filter(f => f.status == 'ENABLED')
      data.forEach(configuredForm => {
        if (configuredForm.user_id !== user_id) {
          return;
        }
        const found = jotForms.find(jot => jot.id == configuredForm.form_id)
        if (!found) {
          configuredForm.warning = "No longer in JotForm"
        }
      })
    }
    return res.status(200).json({ data })
  }
  catch (error)
  {
    if (error?.name == "AxiosError" && error.status === 401) {
      return res.status(401).json({ error: 'This request is not valid because of an internal \'unauthorized\' response'})
    }
    else {
      logger.error("Unabled to get form from JotForm" + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const updateForm = async (req, res) => {
  try {
    const {formId: form_id} = req.params;
    const formData = req.body;
    const { data, error } = await supabase
        .from('forms')
        .update(formData)
        .eq("form_id", form_id)
        .select();

    if (error) throw error;

    return res.status(200).json(data);
  }
  catch (error)
  {
    if (error?.name == "AxiosError" && error.status === 401) {
      return res.status(401).json({ error: 'This request is not valid because of an internal \'unauthorized\' response'})
    }
    else {
      logger.error("Unabled to update form data" + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const newSubmission = async (req, res) => {
  try {
    const {formId} = req.params;
    const { parent_submission_id } = req.query;
    const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(formId)
    
    const jotData  = await addSubmission(userId, formId, {"submission[1]": "NONE"});
    const supaData = await linkUserSubmission({user_id: req.user.id, form_id: formId, submission_id: jotData.submissionID, parent_submission_id: parent_submission_id});
    return res.status(200).json({submissionUrl: `http://www.jotform.com/edit/${jotData.submissionID}`})
  }
  catch (error) {
    logger.error(`error while creating a new submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};