import express from 'express';
import { body, param } from 'express-validator';
import { updateUserConfig, getUserConfig } from '../controllers/userConfigController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ACCOUNT_TYPES } from '../constants/accountTypes.js';

const router = express.Router();

router.put(
  '/users/:user_id/config',
  [
    param('user_id')
      .isUUID()
      .withMessage('Valid user ID is required'),
    body('account_type')
      .isInt({ min: 0, max: 2 })
      .custom((value) => {
        if (!Object.values(ACCOUNT_TYPES).includes(value)) {
          throw new Error('Invalid account type');
        }
        return true;
      })
      .withMessage('Invalid account type. Must be 0 (free), 1 (premium), or 2 (enterprise)'),
    body('jotform_key')
      .optional()
      .isString()
      .isLength({ min: 32, max: 64 })
      .withMessage('JotForm key must be between 32 and 64 characters'),
    validateRequest
  ],
  updateUserConfig
);

router.get(
  '/users/:user_id/config',
  [
    param('user_id')
      .isUUID()
      .withMessage('Valid user ID is required'),
    validateRequest
  ],
  getUserConfig
);

export default router;