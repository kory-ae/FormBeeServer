import express from 'express';
import { param, query, body } from 'express-validator';
import { getJotForm, getJotForms, deleteJotForm, getJotFormSubmissions, addFormFromJot,
         newSubmission, addUserToForm, getFormUsers, getConfiguredForms } from '../controllers/jotFormController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, isPaid } from '../middleware/auth.js';

const router = express.Router();

const validatePagination = [
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ];
  
router.get(
  '/forms/jot', 
  authenticate,
  getJotForms);

router.get(
    '/forms', 
    authenticate,
    getConfiguredForms);


router.get(
    '/form/:formId',
    [
      authenticate,
      validatePagination,
      validateRequest,
    ],
    getJotForm
);

router.delete(
    '/form/:formId',
    [
      authenticate,
      isPaid,
      validatePagination,
      validateRequest
    ],
    deleteJotForm
);

router.get(
    '/form/:formId/submissions',
    [
      authenticate,
      validatePagination,
      validateRequest
    ],
    getJotFormSubmissions
);

router.post(
    '/form/',
    [
      body('jotFormId')
        .isNumeric({ min: 200000000000000 }),
      authenticate, 
      isPaid
    ],
    addFormFromJot);

router.post('/form/:formId/newSubmission', authenticate, newSubmission);
router.post('/form/:formId/user/:userId', [authenticate, isPaid], addUserToForm);
router.get('/form/:formId/users', [authenticate, isPaid], getFormUsers);


export default router;