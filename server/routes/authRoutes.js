import express from 'express';
import { register, login, sendOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);

export default router;
