import express from 'express';
import { authenticate, isPaid } from '../middleware/auth.js';
import { generateCode, getGroupsByUser, addGroup, updateGroup, deleteFormGroup, setGroupImage, getGroupImage, deleteGroupImage } from '../controllers/formGroupController.js';

import  multer  from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Route to generate code
router.post('/formGroup/generateCode',
    [authenticate, isPaid],
     generateCode
);

// Route to get user's form groups
router.get('/formGroups', 
    [
        authenticate,
    ],
    getGroupsByUser);

// Route to add form group
router.post('/formGroup/',
    [authenticate, isPaid],
    addGroup);
    
// Route to update form group
router.put('/formGroup/:id',
    [authenticate, isPaid],
     updateGroup);

router.post('/formGroup/:id/image',
    [authenticate, isPaid],
    upload.single('image'),
    setGroupImage);

router.delete('/formGroup/:id/image', 
    [authenticate, isPaid],
    deleteGroupImage);
    
router.get('/formGroup/:id/image',
    [authenticate],
    getGroupImage
);



// Route to delete form group
router.delete('/formGroup/:id', 
    [authenticate, isPaid],
    
    deleteFormGroup);

export default router;