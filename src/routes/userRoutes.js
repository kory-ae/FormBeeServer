import express from 'express';
import { body } from 'express-validator';
import { createUser, updateUserConfig, getUserView } from '../controllers/userController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/user',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    validateRequest
  ],
  createUser
);

router.put('/user/userConfig', authenticate, updateUserConfig);
router.get('/user', authenticate, getUserView);

export default router;