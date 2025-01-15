import express from 'express';
import { param, query } from 'express-validator';
import { getJotSubmission,  deleteJotSubmission, getGroupParentSubmission} from '../controllers/jotSubmissionController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';

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
    authenticate,
    validateSubmissionId,
    validateRequest
  ],
  getJotSubmission
);

// Get the submissions for a form group's parent
router.get(
  '/submissions/groupParent/:formGroupId',
  [
    authenticate,
    validateRequest
  ],
  getGroupParentSubmission
);


// Delete a specific submission
router.delete(
  '/submissions/:submissionId',
  [
    authenticate,
    validateSubmissionId,
    validateRequest
  ],
  deleteJotSubmission
);

export default router;