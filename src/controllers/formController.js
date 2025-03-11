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
  const parentSubmissions = parentJotFormId ? (await getSubmissionByForm(userId, parentJotFormId, false)) : [];
    
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
  const {data : viewData, error} = await supabase
    .from("forms")
    .select("*, form_group!forms_form_group_id_fkey(parent_form_id)")
    .eq("user_id", userId)
  
  if (error) throw error
  
  let data = [...viewData];
  if(data.length > 0 ){
    data = viewData.map(form => {
      const tmp = {...form};
      delete tmp.form_group;
      tmp["parent_form_id"] = form.form_group?.parent_form_id;
      return tmp;
    })
  }
  return {data, error}
}

export const getFormOwner = async (id) => {
  const {data, error} = await supabase
    .from("forms")
    .select("user_id")
    .eq("id", id)   

  if (error) throw error;

  return data[0].user_id;
}

export const getOwnerByJotFormId = async (form_id) => {
  const {data, error} = await supabase
    .from("forms")
    .select("user_id")
    .eq("form_id", form_id)   

  if (error) throw error;

  return data[0].user_id;
}


async function getConfiguredFormsByAssociation (user) {

  const { data : groupList, error: error1 } = await supabase
    .from("user_form_group")
    .select("*")
    .eq('user_id',user.id)

  if (error1) throw error1;

  const {data: viewData, error} = await supabase
    .from("forms")
    .select("*, form_group!forms_form_group_id_fkey(parent_form_id)")
    .in("form_group_id", groupList.map(x => x.form_group_id))

    //In supabase, how do you get a flat object back instead of a nested one?
    let data = [...viewData];
    if(data.length > 0 ){
      data = viewData.map(form => {
        const tmp = {...form};
        delete tmp.form_group;
        tmp["parent_form_id"] = form.form_group?.parent_form_id;
        return tmp;
      })
    }
    return {data, error};
}

const getJotFormId = async (id) => {
  const {data, error} = await supabase
  .from("forms")
  .select("form_id")
  .eq("id", id)
  .single()

  if (error) throw error
  
  return data.form_id;
}

//TODO: refactor for duplicate forms
export const getJotFormSubmissions = async (req, res) => {
  try {
      const { id } = req.params;
      const includeDelete = req.query.includeDelete === true;

      // might be times where we want empty submissions, but not right now
      const filterEmpty = true;

      const jotFormId = await getJotFormId(id)

      const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(id)
      let jotSubmissions = await getSubmissionByForm(userId, jotFormId, filterEmpty);
      
      const {data: formBeeSubs, error } = await supabase
      .from("submission")
      .select("submission_id, user_id")
      .eq("form_id", id) 

      if (error) throw error;

      if (!includeDelete){
        jotSubmissions = jotSubmissions.filter(submission => submission.status !== "DELETED")
      }
      //Filter out data user is not allowed to see
      //A paid user is able to see everything
      //An anon user is only able to see their stuff
      //Otherwise, the user is able to see everything if the "view_submissions" is true on the form group
      if (!req.user.isPaid) {

        const {data: viewSubData, error: viewSubError} = await supabase
        .from("forms")
        .select("viewable_submissions")
        .eq("id", id)

        if (viewSubError) throw viewSubError

        if (!viewSubData[0].viewable_submissions || req.user.is_anonymous) {
          const userSubmissions = formBeeSubs.filter(x => x.user_id == req.user.id).map( x=> x.submission_id);
          jotSubmissions = jotSubmissions.filter(submission => userSubmissions.includes(submission.id))
        }
      }
      if (req.query.parent_submission_id) {
        const {data: submissionData, error } = await supabase
          .from("submission")
          .select("submission_id")
          .eq("parent_submission_id", req.query.parent_submission_id);
      
        if (error) throw error;

        const userSubmissions = submissionData.map( x=> x.submission_id);
        jotSubmissions = jotSubmissions.filter(submission => userSubmissions.includes(submission.id))
      }

      await addSubmissionMetaData(userId, jotSubmissions);
      return res.status(200).json({forms: jotSubmissions});
    }
    catch (error) {
      logger.error(`error while getting all jot forms for user: ${error}`)
      return res.status(500).json({ error: 'Internal server error' });
    }
};

export const addForm = async (req, res) => {
  try {
    const userId = req.user.id;
    const form = {...req.body};
    form.user_id = req.user.id;

    //I guess we leave this just as a test that this user can access this jot form
    await getForm(userId, form.form_id);

    //this will change to not add form to same group
    const {data: formExistData, error: formExistError} = await supabase
      .from('forms')
      .select('*')
      .eq('form_id', form.form_id)
      .eq('form_group_id', form.form_group_id)

    if (formExistData.length > 0 || formExistError) {
      throw new Error("Form already exists in FormBee")
    }

    const { data, error } = await supabase
      .from('forms')
      .insert(form)
      .select('*')
      .single();

    if (error) {
      logger.error(`error while adding forms records %j`, error);
      throw error;
    }
    return res.status(200).json(data);
  }
  catch (error)
  {
    if (error?.name == "AxiosError" && error.status === 401) {
      return res.status(401).json({ error: 'This request is not valid because of an internal \'unauthorized\' response'})
    }
    else {
      logger.error("Unable to add form from JotForm: %j", error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const getConfiguredForms = async (req, res) => {

  try {
    const userId = req.user.id;
    
    //this can be cleaned up/reverted now that i know the issue.
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
      return res.status(200).json([])
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
    return res.status(200).json(data)
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
    const { id} = req.params;
    const formData = req.body;
    const { data, error } = await supabase
        .from('forms')
        .update(formData)
        .eq("id", id)
        .select('*')
        .single();

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
    const { id } = req.params;
    const { parent_submission_id } = req.query;
    const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(id)
    const jotFormId = await getJotFormId(id)
    const jotData  = await addSubmission(userId, jotFormId, {"submission[1]": "NONE"});

    const userSubData = {
      user_id: req.user.id, 
      form_id: id, 
      submission_id: jotData.submissionID, 
      parent_submission_id: parent_submission_id
    }
    const supaData = await linkUserSubmission(userSubData);
    return res.status(200).json({submissionUrl: `http://www.jotform.com/edit/${jotData.submissionID}`})
  }
  catch (error) {
    logger.error(`error while creating a new submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteForm = async (req, res) => {
  try {
      const { id } = req.params;
      
      const {data, error} = await supabase
        .from('forms')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(204).json();
    }
    catch (error) {
      logger.error(`error while deleting jot form:`)
      logger.error(error)
      return res.status(500).json({ error: 'Internal server error' });
    }
};