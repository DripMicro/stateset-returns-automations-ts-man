import express from 'express';
import callbackRouter from './callback-router';
import loginRouter from './login-router';

const router = express.Router();

router.get('/login', loginRouter);
router.get('/callback', callbackRouter);

export default router;
