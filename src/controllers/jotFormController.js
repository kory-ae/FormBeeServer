import { getForms, getForm, deleteForm, getSubmissionByForm, addSubmission } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';

//const userConfigService = new UserConfigService();

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
