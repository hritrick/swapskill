const express = require('express');

const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidators');

// Public
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

// Protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
