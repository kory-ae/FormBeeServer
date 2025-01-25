import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';

const CODE_LENGTH = 5;

function genRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const generateCode = async (req, res) => {

    let unique = false;
    let result;
    do {
        result = genRandomCode();

        const data = await supabase
        .from('form_group')
        .select('*')
        .eq('code', result)
        .single()

        unique =(data.data ==  null)
    } while(!unique);
    
    return res.send({ code: result });
}

// Dead code?
export const getFormGroup = async (req, res) => {

}

export const addGroup = async (req, res) => {
    try {

        // object from client probably has forms array
        delete req.body.forms;
        //Dont insert zero id
        delete req.body.id;

        const { data, error } = await supabase
            .from('form_group')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error

        res.status(200).json(data);
    } catch (error) {
        logger.error('Error inserting form group:', error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateGroup = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('form_group')
            .update(req.body)
            .eq('id', req.body.id)
            .single();
        if (error) throw error
        return res.status(201).json({msg: "ok"})
    } catch (error) {
        logger.error('Error updating form group:', error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteFormGroup = async (req, res) => {
    try {
        const {data, error } = await supabase
            .from('form_group')
            .delete()
            .eq('id', req.params.id)
        if (error) throw error
        return res.status(202).json({msg: "ok"})
    } catch (error) {
        logger.error('Error deleting form group: ' + error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getGroupsByUser = async (req, res) => {

    try{

        //this implies they are a paid user
        //todo: only do this part if they're a paid user
        const { data, error } = await supabase
            .from('form_group')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) throw error

        const { data: byCodeData, error: byCodeError } = await supabase
            .from('user_form_group')
            .select('*, form_group(*)')
            .eq('user_id', req.user.id)

        if (byCodeError) throw byCodeError

        let allData = data;
        if (byCodeData.length > 0){
             byCodeData
             .filter(x => x.form_group)
             .forEach(x => {
                allData = allData.concat(x.form_group)
             })
        }

        res.status(200).json(allData);
    } catch (error) {
        logger.error('Error getting form groups by user:', error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}