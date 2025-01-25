import { getSubmission, deleteSubmission, getSubmissionByForm } from '../services/jotAPIService.js';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
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
      .select("parent_form_id, forms!form_group_parent_form_id_fkey(form_id, visible_fields, header_field)")
      .eq("id", formGroupId)
      .single();

    //Todo: verify user has access to form group

    if (error) throw error;

    const userId = await formGetFormByUser(data.forms.form_id);
    const submissions = await getSubmissionByForm(userId, data.forms.form_id)

    if (submissions.length == 0) {
      return res.status(400).json({error: "No submissions found"})
    }
    const keySet = Object.keys(submissions[0].answers);
    const formattedData = submissions.map(submission => {
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

    return res.status(200).json({
      headers: data.forms.visible_fields,
      submissions: formattedData,
      header_field: formatField(data.forms.header_field)
    });
  }
  catch (error) {
    logger.error(`error while getting group parent submission: ${error}`)
    return res.status(500).json({ error: 'Internal server error' });
  }
};
