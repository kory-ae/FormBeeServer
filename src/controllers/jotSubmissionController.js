import { getSubmission, deleteSubmission } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';

async function getFormOwner (submission_id) {
  
  const {data, error} = await supabase
    .from("submission")
    .select("form_id, forms(user_id)")
    .eq("submission_id", submission_id);
    
  if (error) 
    throw error;

  return data[0].forms.user_id;
}


export const getJotSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const data = await getSubmission(req.user.id, submissionId);
    return res.status(200).json({forms: data});
  }
  catch (error) {
    logger.error(`error while getting jot submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteJotSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(submissionId)
    
    const jotData = await deleteSubmission(userId, submissionId);
    
    const {data, error} = await supabase
      .from("submission")
      .delete()
      .eq("submission_id", submissionId);
    
    if (error) throw error

    return res.status(200).json({"message": "ok"});
  }
  catch (error) {
    logger.error(`error while deleting jot submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

