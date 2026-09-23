const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/users
 * Admin only (enforced by authorizeRoles in the route).
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Protected — any authenticated user may look up a profile.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) throw new ApiError(404, 'User not found');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Protected — user may only update their own profile; admin can update anyone.
 * Password updates are intentionally blocked here (use PATCH /api/auth/password).
 */
const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorised to update this user');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    if (req.body.password) {
      throw new ApiError(400, 'Use PATCH /api/auth/password to change your password');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Protected — user may delete their own account; admin can delete anyone.
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorised to delete this user');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
