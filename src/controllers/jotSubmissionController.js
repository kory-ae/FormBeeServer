import { getSubmission, deleteSubmission, getSubmissionByForm } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
import { userHasGroupAccess } from '../controllers/formGroupController.js'
import { getFormOwner as formGetFormByUser } from '../controllers/formController.js';

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

function formatField(field) {
  return field
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, 'zz');
}

export const getGroupParentSubmission = async (req, res) => {
  try {
    const { formGroupId } = req.params;

    const {data, error} = await supabase
      .from("form_group")
      .select("parent_form_id, parent_read_only, forms!form_group_parent_form_id_fkey(id, form_id, visible_fields, header_field)")
      .eq("id", formGroupId)
      .single();

    //Todo: verify user has access to form group

    if (error) throw error;

    const userId = await formGetFormByUser(data.forms.id);
    const submissions = await getSubmissionByForm(userId, data.forms.form_id, true)

    if (submissions.length == 0 ) {
      if (data.parent_read_only) {
        return res.status(400).json({error: "No submissions found"})
      } else {
        const resData = {
          headers: data.forms.visible_fields,
          submissions: [],
          header_field: formatField(data.forms.header_field)
        }
        return res.status(200).json(resData)
      }
    }
    const keySet = Object.keys(submissions[0].answers);
    const formattedData = submissions
    //
      .filter(submission => submission.status !== "DELETED")
      .map(submission => {
        let record = {
          id: submission.id
        }
        for (const field of data.forms.visible_fields) {
          const id = keySet.find(x => submission.answers[x].text == field)
          const fieldName = formatField(field)
          let value = "N/A"
          if (id) {
            const row = submission.answers[id];
            if (row) {
              value = row.prettyFormat || row.answer 
            }
          }
          record[fieldName] = value;
        }
        return record;
      });

    const headerSet = data.forms.visible_fields.map(f => {
      return {headerName: f, fieldName: formatField(f)}
    })

    return res.status(200).json({
      headers: headerSet,
      submissions: formattedData,
      header_field: formatField(data.forms.header_field)
    });
  }
  catch (error) {
    logger.error(` 
      : ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const countJotSubmissions = async (req, res) => {

  const userId = req.user.id;
  const { form_id } = req.query;
  try {

    //Not sure about if we want to filter or not....
    const data = await getSubmissionByForm(userId, form_id, false)
    return res.status(200).json({count: data.length})
  }catch (e) {
    return res.status(500).json({message: "Interal error while getting submission count"});
  }
}

export const countChildSubmission = async (req, res) => {
  const userId = req.user.id;
  const { form_group_id } = req.query;
  try {

    const hasAccess = await userHasGroupAccess(userId, form_group_id);
    if (!hasAccess) {
      return res.status(403).json({message: "User does not have access to specified group"})
    }

/*    const {data, error } = await supabase
      .from("form_group")
      .select("id, form!forms_form_group_id_fkey(*), submission!inner(*)", {count: 'exact'})
      .eq("id", form_group_id)   */

    const {data: fg_data, error: fg_error } = await supabase
    .from("form_group")
    .select("parent_form_id")
    .eq("id", form_group_id)
    
    if (fg_error) {
      console.error("Unable to determine parent_form_id while getting child submisssion count")
      console.error(fg_error)
      throw fg_error
    }

    //Group is parentless, return 0 children
    if (fg_data[0] == null) {
      return res.status(200).json({count: 0})
    }

    const parent_form_id = fg_data[0].parent_form_id;
    const { data, error } = await supabase
    .from('forms')
    .select(`*,
      submission(*)
    )`)
    .eq('form_group_id', form_group_id)
  
    if ( error ) throw error;

    const childForms = data.filter(f => f.id != parent_form_id);
    if (childForms.length == 0) {
      return res.status(200).json({count: 0})
    }

    const childSubmissionCount = childForms.reduce((count, form) => {
      return count + form.submission.length;
    }, 0)

    return res.status(200).json({count: childSubmissionCount})
  } catch (e) {
    return res.status(500).json({message: "Interal error while getting submission count"});
  }
};
