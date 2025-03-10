import express from 'express';
import { authenticate, isPaid } from '../middleware/auth.js';
import { generateCode, getFormGroup, getGroupsByUser, addGroup, updateGroup, deleteFormGroup } from '../controllers/formGroupController.js';

const router = express.Router();

// Route to generate code
router.post('/formGroup/generateCode',
    [authenticate, isPaid],
     generateCode
);

// Route to get user's form groups
router.get('/formGroups', 
    [authenticate],
    getGroupsByUser);

// Route to add form group
router.post('/formGroup/',
    [authenticate, isPaid],
    addGroup);
    
// Route to update form group
router.put('/formGroup/:id',
    [authenticate, isPaid],
     updateGroup);

// Route to delete form group
router.delete('/formGroup/:id', 
    [authenticate, isPaid],
    deleteFormGroup);

export default router;