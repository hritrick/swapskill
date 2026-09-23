const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// ─── Token helper ───────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body validated by registerSchema before this runs.
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, 'An account with that email already exists');

    const user = await User.create({ name, email, password, role: role || 'user' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Body validated by loginSchema before this runs.
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Protected — req.user is set by authMiddleware.
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * The client holds the JWT in localStorage; logging out is a client-side
 * discard. This route exists for symmetry, future token-blacklisting, and
 * so the Postman collection has a real endpoint to call.
 */
const logoutUser = async (_req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/password
 * Protected — changes the authenticated user's password.
 * Body validated by changePasswordSchema before this runs.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch the full user document (req.user was fetched with .select('-password'))
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe, logoutUser, changePassword };
