const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { sendWelcomeEmail } = require('../utils/mailer');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email already registered.', 409);
    }

    // Only allow admin role if the request itself comes from an authenticated admin
    // (public registration always creates parking_attendant)
    const assignedRole = role === 'admin' ? 'admin' : 'parking_attendant';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(user);
    logger.info(`New user registered: ${email} (${user.role})`);

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ firstName, lastName, email, role: user.role });

    return successResponse(res, 'Registration successful.', { user, token }, 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken(user);
    logger.info(`User logged in: ${email} (${user.role})`);

    return successResponse(res, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'User profile retrieved.', req.user);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved.',
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/users/:id  (admin only) — toggle active status
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User not found.', 404);

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return errorResponse(res, 'You cannot modify your own account here.', 400);
    }

    const { isActive, role } = req.body;
    await user.update({
      ...(isActive !== undefined && { isActive }),
      ...(role && { role }),
    });

    logger.info(`User updated by admin: ${user.email}`);
    return successResponse(res, 'User updated.', user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getAllUsers, updateUser };
