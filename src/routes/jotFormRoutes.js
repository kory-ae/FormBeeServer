import express from 'express';
import { query } from 'express-validator';
import { getJotForm, getJotForms, getJotFormQuestions } from '../controllers/jotFormController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';

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
    '/jot/form/:formId',
    [
      authenticate,
      validatePagination,
      validateRequest,
    ],
    getJotForm  
);

router.get(
  '/jot/forms', 
  authenticate,
  getJotForms);


router.get(
  '/jot/:formId/questions',
  authenticate, 
  getJotFormQuestions);

export default router;