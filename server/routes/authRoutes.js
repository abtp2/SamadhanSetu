const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getDemoAccounts, sendOtp, verifyOtp } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, updateProfile);
router.get('/demo-accounts', getDemoAccounts);

module.exports = router;
