import JotformPackage from 'jotform'
import { getJotFormKey } from '../services/userConfigService.js';
import logger from '../config/logger.js'

async function initClient(userId){
    const apiKey= await getJotFormKey(userId)
    const Jotform = JotformPackage.default;
    const client = new Jotform(apiKey);
    return client;
}

const callWrapper = async (userId, jotCall) => {

    const client = await initClient(userId);

    const jotResponse = await jotCall(client);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
    {
        logger.error(`Error calling jotform. responseCode: ${jotResponse.responseCode}, message: N/A }`)
        return "Fail";
    }
}

export const getForms = async (userId) => {
    return callWrapper(userId, async (client) => {
        return client.user.getForms();
    })
}

export const getForm = async (userId, jotFormId) => {
    return callWrapper(userId, async (client) => {
        return client.form.get(jotFormId);
    });
}

export const getSubmissionByForm = async (userId, jotFormId) => {
    return callWrapper(userId, async (client) => {
        return client.form.getSubmissions(jotFormId)
    });
}

export const getSubmission = async (userId, submissionId) => {
    return callWrapper(userId, async (client) => {
        return client.submission.get(submissionId);
    });
}

export const deleteSubmission = async (userId, submissionId) => {
    return callWrapper(userId, async (client) => {
        return client.submission.delete(submissionId);
    });
}

export const addQuestionToForm = async (userId, formId, question) => {    
    return callWrapper(userId, async (client) => {
        return client.addFormQuestion(formId, question);
    });
}

export const addSubmission = async (userId, formId, submission) => {
    return callWrapper(userId, async (client) => {
        return client.form.addSubmission(formId, submission);
    });
}

export const getFormQuestions = async (userId, formId) => {
    return callWrapper(userId, async (client) => {
        return client.form.getQuestions(formId);
    });
}