import { supabase } from '../config/supabase.js';
import { ACCOUNT_TYPES } from '../types/accountTypes.js';

export const getJotFormKey = async (userId) => {
    
    const { data, error } = await supabase
        .from('user_config')
        .select('jotform_key')
        .eq('user_id', userId)
        .single();

    if (error || !data?.jotform_key) {
        throw new Error('JotForm API key not found in user configuration');
    }
    return data.jotform_key;
}

export const getJotFormKeyByForm = async (formId) => {
    
    const { data, error } = await supabase
        .from('form')
        .select('user_id')
        .eq('form_id', formId)
        .single();

    if (error || !data?.user_id) {
        throw new Error('JotForm API key not found in user configuration');
    }

    return getJotFormKey(data.userId);
}

export const isPaidAccount = async (userId) => {
    
    const { data, error } = await supabase
        .from('user_config')
        .select('account_type_id')
        .eq('user_id', userId)
        .single();

    if (error || !data?.account_type_id) {
        throw new Error('JotForm API key not found in user configuration');
    }
    return data.account_type_id !== ACCOUNT_TYPES.FREE;
}