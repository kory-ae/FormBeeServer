import express from 'express';
import { param, query } from 'express-validator';
import { getJotForm, getJotForms, deleteJotForm, getJotFormSubmissions } from '../controllers/jotFormController.js';
import { validateRequest } from '../middleware/validateRequest.js';

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
  
router.get('/forms', getJotForms);

router.get(
    '/form/:formId',
    [
      validatePagination,
      validateRequest
    ],
    getJotForm
);

router.delete(
    '/form/:formId',
    [
      validatePagination,
      validateRequest
    ],
    deleteJotForm
);


router.get(
    '/form/:formId/submissions',
    [
      validatePagination,
      validateRequest
    ],
    getJotFormSubmissions
);

export default router;