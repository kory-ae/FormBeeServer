import { getForms, getForm, deleteForm, getSubmissionByForm } from '../services/jotAPIService.js';
import logger from '../config/logger.js';

//const userConfigService = new UserConfigService();

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
        const data = await getSubmissionByForm(12, formId);
        return res.status(200).json({forms: data});
      }
      catch (error) {
        logger.error(`error while getting jot all forms for user: ${error}`)
        return res.status(500).json({ error: 'Internal server error' });
      }
};