import { getForms, getForm, deleteForm, getSubmissionByForm, addSubmission, getFormQuestions } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';

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

async function getConfiguredFormsByUser (userId) {
  return await supabase
    .from("forms")
    .select("*")
    .eq("user_id", userId)
}

async function getFormOwner (formId) {
  const {data, error} = await supabase
    .from("forms")
    .select("user_id")
    .eq("form_id", formId)   

  if (error) 
    throw error;

  return data[0].user_id;
}

async function getConfiguredFormsByAssociation (userId) {
  const { data : formList, error: error1 } = await supabase
    .from("form_user")
    .select("form_id")
    .eq("user_id", userId)

  if (error1) return {formList, error1};

  const {data, error} = await supabase
    .from("forms")
    .select("*")
    .in("form_id", formList.map(x => x.form_id))

  return {data, error};
}

function formatJotQuestions (questions) {
  if (!questions || questions.length ==0) {
    return [];
  }

  const nonfillableTypes = [
    "control_head",
    "control_button"
    //divider
    //section
    //page break
  ]
  
  const entries = Object.entries(questions)
  
  return entries
  .filter( ([_, q]) => !nonfillableTypes.includes(q.type))
  .map(([_, q]) => {
    return {
     name: q.name,
     order: q.order,
     id: q.qid,
     header: q.text
    }
  })
  .sort((a,b) => parseInt(a.order) - parseInt(b.order))

}

export const getJotForms = async (req, res) => {
  try {
    const data = await getForms(req.user.id);
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
        const data = await getForm(req.user.id, formId);
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
        const data = await deleteForm(req.user.id, formId);

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
        const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(formId)
        let data = await getSubmissionByForm(userId, formId);
        if (!includeDelete){
          data = data.filter(submission => submission.status !== "DELETED")
        }
        if (!req.user.isPaid) {
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

export const newSubmission = async (req, res) => {
  try {
    const {formId} = req.params;
    const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(formId)
    
    const jotData  = await addSubmission(userId, formId, {"submission[1]": "NONE"});
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
      .from("form_user")
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
      .from("form_user")
      .select("*")
      .eq("form_id", formId)

     //would like to get more info about the user but supabase doesnt allow us to query the auth.user table.
     //might need to build that into user profile table (and change FK)
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
      logger.error("Unabled to get form from JotForm" + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const getConfiguredForms = async (req, res) => {

  try {
    const userId = req.user.id;
    const { data, error } = (req.user.isPaid) ? await getConfiguredFormsByUser(userId) : await getConfiguredFormsByAssociation(userId)

    if (error) {
      logger.error(`error while getting configured forms: ${error}`);
      throw error;
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

export const getJotFormQuestions = async (req, res) => {
  try {
    const {formId} = req.params;
    const data = await getFormQuestions(req.user.id, formId);
    const formattedQuestions = formatJotQuestions(data)
    return res.status(200).json({formattedQuestions});
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
    const {formId} = req.params;
    const formData = req.body;
    const { data, error } = await supabase
        .from('forms')
        .update(formData)
        .eq("form_id", formId)
        .select();

    return res.status(200).json(data);
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
