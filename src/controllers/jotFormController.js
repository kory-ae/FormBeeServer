import { getForms, getForm, getFormQuestions } from '../services/jotAPIService.js';
import { getFormOwner, getOwnerByJotFormId } from './formController.js'
import logger from '../config/logger.js';

function formatJotQuestions (questions) {
  if (!questions || questions.length ==0) {
    return [];
  }

  const nonfillableTypes = [
    "control_head",
    "control_button",
    "control_divider",
    "control_collapse",
    "control_pagebreak"
  ]
  
  const entries = Object.entries(questions)
  
  entries.forEach(([x, y]) => {
    console.log(`qid: ${y.qid}, type: ${y.type}`);
  })

  return entries
  .filter( ([_, q]) => !nonfillableTypes.includes(q.type))
  .map(([_, q]) => {
    const header = (q.text && q.text.length > 0) ? q.text : q.name
    return {
     name: q.name,
     order: q.order,
     id: q.qid,
     header: header
    }
  })
  .sort((a,b) => parseInt(a.order) - parseInt(b.order))
}

export const getJotForm = async (req, res) => {
  try {
      const { formId } = req.params;        
      const data = await getForm(req.user.id, formId);
      return res.status(200).json(data);
    }
    catch (error) {
      if (error?.name == "AxiosError" && error.status === 401) {
        return res.status(error.status).json({ error: 'Internal server error' });  
      }
      logger.error(`error while getting single jot form: ${error}`)
      return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getJotForms = async (req, res) => {
  try {
    const data = await getForms(req.user.id);
    const nonDeletedForms = data.filter(x => x.status !== 'DELETED')
    return res.status(200).json(nonDeletedForms);
  }
  catch (error) {
    logger.error(`error while getting jot forms: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJotFormQuestions = async (req, res) => {
  try {
    const {formId} = req.params;
    //should check user has access...
    let userId = await getOwnerByJotFormId(formId)

    if (!userId && req.user.isPaid) {
      //This is null if the form isn't created yet.
      //
      userId = req.user.id;
    }
    const data = await getFormQuestions(userId, formId);
    const formattedQuestions = formatJotQuestions(data)
    return res.status(200).json({formattedQuestions});
  }
  catch (error)
  {
    if (error?.name == "AxiosError" && error.status === 401) {
      return res.status(401).json({ error: 'This request is not valid because of an internal \'unauthorized\' response'})
    }
    else {
      logger.error(" Unable to get questions from JotForm")
      logger.error(error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}
