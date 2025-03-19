import express from 'express';
import { param, query } from 'express-validator';
import { getJotSubmission,  deleteJotSubmission, getGroupParentMeta, countJotSubmissions, countChildSubmission} from '../controllers/jotSubmissionController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate, isPaid } from '../middleware/auth.js';
import logger from '../config/logger.js';


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

// get number of submissions for a particular form
// Note this has to come before '/submissions/:submissionId' because express is stupid
router.get(
  '/submissions/jot/count',
  [ 
    authenticate, 
    isPaid
  ],
  countJotSubmissions
);

//count how many submissions are in formBee for the group, excluding parent submissisons
router.get(
  '/submissions/childSubmissions/count',
  [ 
    authenticate, 
    isPaid
  ],
  countChildSubmission
);

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

// Get the meta data for a form group's parent
router.get(
  '/submissions/groupParentMeta/:formGroupId',
  [
    authenticate,
    validateRequest
  ],
  getGroupParentMeta
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