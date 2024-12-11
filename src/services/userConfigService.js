import { supabase } from '../config/supabase.js';

export class UserConfigService {

    async getJotFormKey(userId) {
        /* EVENTUALLY THIS WILL COME FROM THE DB 
        const { data, error } = await supabase
            .from('user_configs')
            .select('jotform_key')
            .eq('user_id', userId)
            .single();

        if (error || !data?.jotform_key) {
            throw new Error('JotForm API key not found in user configuration');
        }
        */
        return '551e79ddb4528873871c64516e854ef6';
    }
}