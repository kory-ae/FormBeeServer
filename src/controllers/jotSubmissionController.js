import { getSubmission, deleteSubmission } from '../services/jotAPIService.js';
import logger from '../config/logger.js';

export const getJotSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const data = await getSubmission(12, submissionId);
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
    const data = await deleteSubmission(12, submissionId);
    return res.status(200).json({forms: data});
  }
  catch (error) {
    logger.error(`error while deleting jot submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/*
export const deleteSubmission = async (req, res) => {
  try {
    const { submission_id } = req.params;

    // todo check if the submission exists and belongs to the user    

    //todo pass in API KEY
    const apiKey = '551e79ddb4528873871c64516e854ef6';    
    const Jotform = JotformPackage.default;
    const client = new Jotform(apiKey);

    const jotResponse = await client.submission.delete(submission_id);
    if (jotResponse.responseCode == 200){
        return res.status(200).json({
            message: 'Submission deleted successfully'
            });    
    }
    else {
        return res.status(jotResponse.responseCode).json({
            message: `failure from jot ${jotResponse.message}`
        });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};*/