import express from 'express';
import { param, query } from 'express-validator';
import { getJotSubmission,  deleteJotSubmission } from '../controllers/jotSubmissionController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const validateSubmissionId = param('submissionId')
  .isInt()
  .withMessage('Valid submission ID is required');

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Get a specific submission
router.get(
  '/submissions/:submissionId',
  [
    validateSubmissionId,
    validateRequest
  ],
  getJotSubmission
);

// Delete a specific submission
router.delete(
  '/submissions/:submissionId',
  [
    validateSubmissionId,
    validateRequest
  ],
  deleteJotSubmission
);

export default router;