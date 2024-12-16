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

