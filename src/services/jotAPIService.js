import JotformPackage from 'jotform'

function initClient(userId){
    //TODO: Get apiKey from userId
    const apiKey=process.env.MOCK_API_KEY
    const Jotform = JotformPackage.default;
    const client = new Jotform(apiKey);
    return client;
}

export const getForms = async (userId) => {
    const client = initClient(userId);
    const jotResponse = await client.user.getForms();
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}

export const getForm = async (userId, jotFormId) => {
    const client = initClient(userId);
    const jotResponse = await client.form.get(jotFormId);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}

export const getSubmissionByForm = async (userId, jotFormId) => {
    const client = initClient(userId);
    const jotResponse = await client.form.getSubmissions(jotFormId);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}


export const deleteForm = async (userId, jotFormId) => {
    const client = initClient(userId);
    const jotResponse = await client.form.delete(jotFormId);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}

export const getSubmission = async (userId, submissionId) => {
    const client = initClient(userId);
    const jotResponse = await client.submission.get(submissionId);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}


export const deleteSubmission = async (userId, submissionId) => {
    const client = initClient(userId);
    const jotResponse = await client.form.delete(jotFormId);
    if (jotResponse.responseCode == 200){
        return jotResponse.content;
    }
    else 
        return "Fail";
}

