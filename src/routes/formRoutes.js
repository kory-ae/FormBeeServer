import express from 'express';
import { query, body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, isPaid } from '../middleware/auth.js';
import { deleteForm, getJotFormSubmissions, addForm, getFormUsers, getConfiguredForms,  updateForm, newSubmission } from '../controllers/formController.js';

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
  
router.delete(
    '/form/:formId',
    [
      authenticate,
      isPaid,
      validatePagination,
      validateRequest
    ],
    deleteForm
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
      authenticate, 
      isPaid
    ],
    addForm
);

router.get(
    '/forms', 
    authenticate,
    getConfiguredForms);

router.put(
  '/form/:formId/', 
  [
    //TODO: validate body
    authenticate, 
    isPaid
  ], 
  updateForm);

router.post(
  '/form/:formId/newSubmission', 
  authenticate, 
  newSubmission);

export default router;