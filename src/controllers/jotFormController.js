import { getForms, getForm, getSubmissionByForm, addSubmission, getFormQuestions } from '../services/jotAPIService.js';
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

async function updateNewFormUser() {
  
  const { data : newFormUser, error: error1 } = await supabase
    .from("form_user")
    .select("id,email")
    .is('user_id', null)

  if (error1) throw error1

  if (newFormUser.length == 0)
    return

  const {data: existingUsers, error: error2} = await supabase
    .from("users")
    .select("id,email")
    .filter(
      'email',
      'in',
      `(${newFormUser.map(x => x.email.toLowerCase())})`
    )
    //.in('email', )

  if (error1) throw error2

  if (existingUsers.length == 0)
    return

  const updateSet = newFormUser.reduce((acc, curr) =>{
      const foundUser = existingUsers.find(e => e.email.toLowerCase() == curr.email.toLowerCase() )
      if (foundUser) {
        curr.user_id = foundUser.id
        curr.email = null
        acc.push(curr)
      }
      return acc
  }, [])

  const {data: resultData, error: error3} = await supabase
    .from("form_user")
    .update(updateSet)
    .select('*')
    .in('id', updateSet.map(x => x.id))

  if (error3) throw error3

}

async function getConfiguredFormsByAssociation (user) {

  const { data : formList, error: error1 } = await supabase
    .from("form_user")
    .select("*")
    .or(`user_id.eq.${user.id},email.ilike.${user.email}`)

  if (error1) return {formList, error1};

  if (formList.some(x => x.email)){
    updateNewFormUser()
  }

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
    "control_button",
    "control_divider",
    "control_collapse",
    "control_pagebreak"
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
        if (error?.name == "AxiosError" && error.status === 401) {
          return res.status(error.status).json({ error: 'Internal server error' });  
        }
        logger.error(`error while getting single jot form: ${error}`)
        return res.status(500).json({ error: 'Internal server error' });
      }
};

export const deleteForm = async (req, res) => {
    try {
        const { formId } = req.params;
        
        const {data, error} = await supabase
          .from('forms')
          .delete()
          .eq('form_id', formId)

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
        const {includeDelete} = req.query.includeDelete === true;;

        logger.info(`Getting submissions for form ${formId}`)

        const userId =  (req.user.isPaid) ? req.user.id : await getFormOwner(formId)
        let data = await getSubmissionByForm(userId, formId);
        if (!includeDelete){
          data = data.filter(submission => submission.status !== "DELETED")
        }
        logger.info(`Found ${data.length} rows for form ${formId}`)
        if (!req.user.isPaid) {
          logger.info(`User is free user, filtering list to user's submissions`)
          const {data: submissionData, error } = await supabase
            .from("submission")
            .select("submission_id")
            .eq("user_id", req.user.id);
          
            if (error) throw error;

            const userSubmissions = submissionData.map( x=> x.submission_id);


          data = data.filter(submission => userSubmissions.includes(submission.id))
          logger.info(`...now ${data.length} rows for form ${formId}`)
        }
        logger.info(`RETURNING: ${data.length} rows for form ${formId}`)
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

function filterUserList (emailList, userData, formUserData) {

  //Email exists in user table, but does not exist in user_form table
  const existingUsersToInvite = userData
    .reduce( (acc, curr) =>{
      const invited = emailList.includes(curr.email)
      const alreadyAdded = formUserData.some(x => curr.id == x.user_id)
      
      if(invited && !alreadyAdded) {
        acc.push({user_id: curr.id, email: null});    
      }
      return acc
    },[]);

  //Email does not exist in user table or user_form table
  const newUsersToInvite = emailList
    .reduce( (acc, curr) => {
      const notInUserTable = !userData.some(x => x.email == curr)
      const notInFormTable = !formUserData.some(x => x.email == curr)
      
      if (notInFormTable && notInUserTable) {
        acc.push({user_id: null, email: curr})
      }
      return acc
    }, [])

  const addList = existingUsersToInvite.concat(newUsersToInvite);

  //userForm has an email not in input or an id whose user.email is not in input
  const deleteList = formUserData
    .reduce( (acc, curr) => {
      console.log(`looking at: ${curr.user_id}, ${curr.email}`)
      let listed = emailList.includes(curr.email);
      console.log(`email listed? ${listed}`)
      if (curr.user_id) {
        const userEmail = userData.find(x => x.id == curr.user_id).email
        listed = emailList.includes(userEmail)
      }      
      console.log(`now listed ? ${listed}`)
      if (!listed) {
        acc.push(curr)
      }
      return acc
    },[])

  return {addList, deleteList}
}

export const updateUserList = async (req, res) => {
  try {
    const {formId} = req.params;
    const emailList = req.body

    const {data: formUser_data, error: selectError} = await supabase
      .from("form_user")
      .select("user_id, email")
      .eq('form_id', formId);

    if (selectError) {
      throw selectError
    }

    const {data: userData, error: selectUserError} = await supabase
      .from('users')
      .select('id, email')

    if (selectUserError) {
      throw selectUserError
    }

    const {addList, deleteList } = filterUserList(emailList, userData, formUser_data);
    addList.forEach(a => a.form_id = formId)
    const {error: insertError} = await supabase
      .from("form_user")
      .insert(addList)

    const { error: deleteError } = await supabase
      .from("form_user")
      .delete()
      .eq("form_id", formId)
      .in('user_id', deleteList.map(x => x.user_id))
      
    const { error: deleteError2 } = await supabase
      .from("form_user")
      .delete()
      .eq("form_id", formId)
      .in('email', deleteList.filter(x => x.email).map(x => x.email))
           
    if (deleteError || deleteError2) {
        throw deleteError ? deleteError :  deleteError2
    } 

    const {data: newFormData, error: newSelectError} = await supabase
        .from("form_user")
        .select("email, users(email)")
        .eq('form_id', formId);

      if (newSelectError) {
        throw selectError
      }

    return res.status(200).json(newFormData);
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
      logger.error("Unable to get form from JotForm: " + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}

export const getConfiguredForms = async (req, res) => {

  try {
    logger.debug("Starting get configured forms")
    const userId = req.user.id;
    const { data, error } = (req.user.isPaid) ? await getConfiguredFormsByUser(userId) : await getConfiguredFormsByAssociation(req.user)
    logger.debug("have user Id list")
    if (error) {
      logger.error(`error while getting configured forms: ${error}`);
      throw error;
    }

    //Get jot forms to warn about removed forms
    const userIdList = [... new Set(data.map(x => x.user_id))]
    //await userIdList.forEach(async (user_id) => {
    for(const user_id of userIdList) {
      logger.debug("looking user Id " + user_id)
      const jotForms = (await getForms(user_id)).filter(f => f.status == 'ENABLED')
      logger.debug("have jot forms for user")
      data.forEach(configuredForm => {
        logger.debug("looking for missing")
        if (configuredForm.user_id !== user_id) {
          return;
        }
        const found = jotForms.find(jot => jot.id == configuredForm.form_id)
        if (!found) {
          configuredForm.warning = "No longer in JotForm"
        }
      })
      logger.debug("done looking at that userId")
    }
    logger.debug("... done get configuredForms")
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
    const userId = req.user.isPaid ? req.user.id : await getFormOwner(formId)
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
      logger.error("Unabled to get form from JotForm" + error)
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
      logger.error("Unabled to update form data" + error)
      return res.status(500).json({ error: 'Internal server error' });  
    }
  } 
}
