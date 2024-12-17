import { getForms, getForm, deleteForm, getSubmissionByForm, addSubmission } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';


async function joinUserData(intialData){

  const userIds = intialData.map((row) => {
    return row.user_id;
  });

  const { data, error } = await supabase
  .from('auth.users')
  .select('id, email')
  .in('id', userIds);

  if (error) 
    throw error

  return data;

}

async function linkUserSubmission(submissionData){
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

export const getJotForms = async (req, res) => {
  try {
    const data = await getForms(12);
    return res.status(200).json({forms: data});
  }
  catch (error) {
    logger.error(`error while getting jot forms: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJotForm = async (req, res) => {
    try {
        const { formId } = req.params;        
        const data = await getForm(12, formId);
        return res.status(200).json({forms: data});
      }
      catch (error) {
        logger.error(`error while getting single jot form: ${error}`)
        return res.status(500).json({ error: 'Internal server error' });
      }
};

export const deleteJotForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const data = await deleteForm(12, formId);

        return res.status(200).json({forms: data});
      }
      catch (error) {
        logger.error(`error while deleting jot form: ${error}`)
        return res.status(500).json({ error: 'Internal server error' });
      }
};

export const getJotFormSubmissions = async (req, res) => {
    try {
        const { formId } = req.params;
        const {includeDelete} = req.query.includeDelete === true;
        let data = await getSubmissionByForm(12, formId);
        if (!includeDelete){
          data = data.filter(submission => submission.status !== "DELETED")
        }
        return res.status(200).json({forms: data});
      }
      catch (error) {
        logger.error(`error while getting jot all forms for user: ${error}`)
        return res.status(500).json({ error: 'Internal server error' });
      }
};

export const newSubmission = async (req, res) => {
  try {
    const {formId} = req.params;
    const jotData  = await addSubmission(req.user.id, formId, {"submission[1]": "NONE"});
    const supaData = await linkUserSubmission({user_id: req.user.id, form_id: formId, submission_id: jotData.submissionID});
    return res.status(200).json({submissionUrl: `http://www.jotform.com/edit/${jotData.submissionID}`})
  }
  catch (error) {
    logger.error(`error while creating a new submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addUserToForm = async (req, res) => {
  try {

    const {formId, userId} = req.params;

    //TODO make sure the user isnt already associated with the form

    // Insert the row and return the inserted data
    const { data, error } = await supabase
      .from("survey_user")
      .insert({form_id: formId, user_id: userId})
      .select()

    if (error) {
      throw error
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error(`error while adding user to jot form: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const getFormUsers = async (req, res) => {
  try {

    const {formId} = req.params;
    // Insert the row and return the inserted data
    const { data, error } = await supabase
      .from("survey_user")
      .select("*")
      .eq("form_id", formId)

     //would like to get more info about the user but supabase doesnt allow us to query the auth.user table.
     //might need to build that into user profile table (and change FK)
    return res.status(200).json(data)
  } catch (error) {
    logger.error('Error inserting submission row:', error.message)
    throw error
  }
}