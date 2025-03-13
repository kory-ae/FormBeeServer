import { group } from 'console';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';
import fs from 'fs'

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
        delete req.body.has_image
        const { data, error } = await supabase
            .from('form_group')
            .update(req.body)
            .eq('id', req.body.id)
            .select('*')
            .single();
        if (error) throw error
        return res.status(200).json(data)
    } catch (error) {
        logger.error('Error updating form group:', error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteFormGroup = async (req, res) => {
    try {
        const groupId = req.params.id;

        const {data: groupImageData, error: groupImageError} = await supabase
        .from('form_group')
        .select('group_image_path')
        .eq('id', groupId)
        .single();

        if (groupImageData && groupImageData.group_image_path) {
            const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('group-image')
            .remove([groupImageData.group_image_path]);
        }

        const {data, error } = await supabase
            .from('form_group')
            .delete()
            .eq('id', groupId)
        if (error) throw error
        return res.status(204).json();
    } catch (error) {
        logger.error('Error deleting form group: ' + error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const queryFormGroups = async (userId) => {

    //this implies they are a paid user
    //todo: only do this part if they're a paid user
    //this may not be true, we may have "free" level users that can create groups
    const { data, error } = await supabase
    .from('form_group')
    .select('*')
    .eq('user_id', userId);
    
    if (error) throw error
    
    const { data: byCodeData, error: byCodeError } = await supabase
    .from('user_form_group')
    .select(`*, form_group(*)`)
    .eq('user_id', userId)
    
    if (byCodeError) throw byCodeError
    
    let allData = data;
    if (byCodeData.length > 0){
     byCodeData
     .filter(x => x.form_group)
     .forEach(x => {
        allData = allData.concat(x.form_group)
     })
    }
    return allData;
}

export const getGroupsByUser = async (req, res) => {

    try {
        const data = await queryFormGroups(req.user.id)
        res.status(200).json(data);
    } catch (error) {
        logger.error('Error getting form groups by user:', error.message)
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const userHasGroupAccess = async (userId, formGroupId) => {
    const {data, error} = await supabase
        .from('form_group')
        .select('*')
        .eq('user_id', userId)
        .eq('id', formGroupId)

    if (error) throw error

    const hasAccess = (data.length > 0)
    return hasAccess;
}

export const setGroupImage_old = async (req, res) => {
    try {
        const groupId = req.params.id;
        
        // Check if file was uploaded
        if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
        }

        // Read the file as buffer - this gives us binary data directly
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        
        // Update the formGroup table
        const { data, error } = await supabase
        .from('form_group')
        .update({ group_image: base64Image })
        .eq('id', groupId)
        .select('*')
        .single();
        
        // Clean up the temporary file
        //fs.unlinkSync(req.file.path);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({  message: 'Group image updated successfully' });
    } catch (error) {
        console.error('Error updating group image:', error);
        return res.status(500).json({ error: 'Failed to update group image' });
    }
}

export const setGroupImage = async (req, res) => {
    try {
        const groupId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const fileBuffer = fs.readFileSync(req.file.path);
        const fileName = `group-${groupId}.png`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('group-image')
            .upload(fileName, fileBuffer, {
                contentType: 'image/png',
                upsert: true // Overwrite if exists
            });
            
        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw uploadError;
        }
        
        // Update your database with the path reference
        const { data, error } = await supabase
            .from('form_group')
            .update({ 
                group_image_path: fileName
            })
            .eq('id', groupId)
            .single();
            
        // Clean up the temporary file
        fs.unlinkSync(req.file.path);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ group_image_path: fileName });
    } catch (error) {
        console.error('Error updating group image:', error);
        return res.status(500).json({ error: 'Failed to update group image' });
    }
}

export const getGroupImage = async (req, res) => {
    try {
        const groupId = req.params.id;

        const { data: formGroup, error } = await supabase
        .from('form_group')
        .select('group_image_path')
        .eq('id', groupId)
        .single();
        
        if (error || !formGroup || !formGroup.group_image_path) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Option 1: Redirect to the public URL
        const { data: publicUrlData } = supabase
            .storage
            .from('group-image')
            .getPublicUrl(formGroup.group_image_path);

        return res.status(200).json({imageUrl: publicUrlData.publicUrl})
    } catch (error) {
        console.error('Error updating group image:', error);
        return res.status(500).json({ error: 'Failed to update group image' });
    }
}

export const deleteGroupImage = async (req, res) => {
    try {
        const groupId = req.params.id;

        const {data: groupImageData, error: groupImageError} = await supabase
        .from('form_group')
        .select('group_image_path')
        .eq('id', groupId)
        .single();

        if (groupImageError) throw groupImageError

        if (groupImageData && groupImageData.group_image_path) {
            const { data: uploadData, error: deleteError } = await supabase
            .storage
            .from('group-image')
            .remove([groupImageData.group_image_path]);

            if (deleteError) throw deleteError;
        }
        return res.status(204).json();
    } catch (error) {
        console.error('Error deleting group image:', error);
        return res.status(500).json({ error: 'Failed to delete group image' });
    }
}