import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
import { getForm, getForms, getSubmission, addSubmission, getSubmissionByForm } from '../services/jotAPIService.js';

async function addSubmissionMetaData(userId, submissionData) {
  //augment data with parent header and submitter data (if available)
  const {data: metaSubData, error: metaSubError} = await supabase
  .from("submission")
  .select(`
    id,
    submission_id,
    parent_submission_id,
    users(
      email
    ),
    forms (
      form_group_id,
      form_group!forms_form_group_id_fkey (
        group_name,
        forms!form_group_parent_form_id_fkey(
          form_id,
          header_field
        )
      )
    )
  `)
  .in('submission_id', submissionData.map(sub => sub.id))

  if (metaSubError) {
    logger.error("Error while finding metaSubData...")
    logger.error(metaSubData)
  }

  //if no matching records in submission, we're done.
  if ( metaSubData.length === 0 ) return
  
  const parentJotFormId = metaSubData[0]?.forms?.form_group?.forms?.form_id;
  const header_field = metaSubData[0]?.forms?.form_group?.forms?.header_field;
  const parentSubmissions = parentJotFormId ? (await getSubmissionByForm(userId, parentJotFormId)) : [];
    
  if (parentSubmissions.length == 0){
    return;
  }

  const parentKeys = Object.keys(parentSubmissions[0].answers);
  const headerKey = parentKeys.find(k => parentSubmissions[0].answers[k].text == header_field);
  submissionData.forEach( sub => {
    //get parent 
    const metaSub = metaSubData.find(x=> x.submission_id == sub.id)
    if(metaSub?.parent_submission_id) {
      const parentSub = parentSubmissions.find(x => x.id == metaSub?.parent_submission_id);
      if (parentSub) {
        const rec = parentSub.answers[headerKey];
        sub.__fbHeaderValue = rec.prettyFormat || rec.answer;
      }
    }
    //email much easier
    sub.__fbSubmitterEmail = metaSubData.find(m => m.submission_id == sub.id)?.users?.email ?? "N/A";
  })
}

export async function linkUserSubmission(submissionData) {
  try {
    // Insert the row and return the inserted data
    const { data, error } = await supabase
      .from("submission")
      .insert(submissionData)
      .select()

    if (error) throw error
    
    return data
  } catch (error) {
    logger.error('Error inserting submission row:', error.message)
    throw error
  }
}

async function getConfiguredFormsByUser (userId) {
  const {data, error} = await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
  
    if (error) throw error
  
  return {data, error}
}

export const getFormOwner = async (formId) => {
  const {data, error} = await supabase
    .from("forms")
    .select("user_id")
    .eq("form_id", formId)   

  if (error) throw error;

  return data[0].user_id;
}

async function getConfiguredFormsByAssociation (user) {

  const { data : groupList, error: error1 } = await supabase
    .from("user_form_group")
    .select("*")
    .eq('user_id',user.id)

  if (error1) throw error1;

  const {data, error} = await supabase
    .from("forms")
    .select("*")
    .in("form_group_id", groupList.map(x => x.form_group_id))

  return {data, error};
}

export const deleteForm = async (req, res) => {
  try {
      const { formId } = req.params;
      
      const {data, error} = await supabase
        .from('forms')
        .delete()
        .eq('form_id', formId)

      if (error) throw error
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
      const { includeDelete } = req.query.includeDelete === true;
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
      if (req.query.parent_submission_id) {
        const {data: submissionData, error } = await supabase
          .from("submission")
          .select("submission_id")
          .eq("parent_submission_id", req.query.parent_submission_id);
      
        if (error) throw error;

        const userSubmissions = submissionData.map( x=> x.submission_id);
        data = data.filter(submission => userSubmissions.includes(submission.id))
      }

      await addSubmissionMetaData(userId, data);
      return res.status(200).json({forms: data});
    }
    catch (error) {
      logger.error(`error while getting all jot forms for user: ${error}`)
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
      logger.error(`error while adding forms records`)
      logger.error(error);
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
      logger.error("Unable to add form from JotForm: ")
      logger.error(error);
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const getConfiguredForms = async (req, res) => {

  try {
    const userId = req.user.id;
    
    //this can be cleaned up/reverted now that i know there issue.
    //It was just returning data, but now it should return data/error
    let data, error
    if (req.user.isPaid) {
      const {data: pdData, error: pdError } = await getConfiguredFormsByUser(userId);
      data =  pdData;
      error = pdError;
    } else {
      const {data: pdData, error: pdError } = await getConfiguredFormsByAssociation(req.user)
      data =  pdData;
      error = pdError;
    }
    if (error) {
      logger.error(`error while getting configured forms: ${error}`);
      throw error;
    }

    
    if (!data || data.length == 0) {
      return res.status(200).json({ data: [] })
    }

    //Get jot forms to warn about removed forms
    const userIdList = [... new Set(data.map(x => x.user_id))]
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
      logger.error("Unable to get configured forms: ");
      logger.error(error);
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
      logger.error("Unable to update form data")
      logger.error(error);
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