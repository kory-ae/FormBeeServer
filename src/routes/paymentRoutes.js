import express from 'express';

import { getCustomerDetails, getPaymentDetails, getInvoiceList, subscribe, unsubscribe, changePaymentDetails } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get(
    '/payment/customer',
    [
      authenticate,
    ],
    getCustomerDetails
);

router.get(
  //change to /payment/method?
  '/payment/details',
  [
    authenticate
  ],
  getPaymentDetails
);

router.post(
  '/payment/changePaymentMethod',
  [
    authenticate
  ],
  changePaymentDetails
);


router.get(
  '/payment/invoices',
  [
    authenticate
  ],
  getInvoiceList
);


router.post(
  '/payment/subscribe',
    [
      authenticate
    ], 
    subscribe
);

router.post(
  '/payment/unsubscribe',
    [
      authenticate
    ], 
    unsubscribe
);

export default router;