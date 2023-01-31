import express from 'express';
import createReturn from './create-return';
import getAllReturns from './get-all-returns';
import refundReturn from './refund-return';
import reopenReturn from './reopen-return';
import getFulfillments from './get-fulfillments';
import cancelReturn from './cancel-return';
import closeReturn from './close-return';

const router = express.Router();

router.post('/get-all-returns', getAllReturns);

router.post('/create-return', createReturn);

router.post('/refund-return', refundReturn);

router.post('/reopen-return', reopenReturn);

router.post('/cancel-return', cancelReturn);

router.post('/close-return', closeReturn);

router.post('/get-fulfillments', getFulfillments);

export default router;
