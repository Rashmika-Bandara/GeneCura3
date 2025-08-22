const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Geneticist = require('../models/Geneticist');
const Pharmacologist = require('../models/Pharmacologist');
const { protect, getModelByRole } = require('../middleware/auth');
const { generateToken, generateRefreshToken, setTokenCookies, clearTokenCookies } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/),
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('licence_id').trim().isLength({ min: 1 }),
  body('mobile_number').matches(/^(\+\d{1,3}[- ]?)?\d{10,15}$/),
  body('date_of_birth').isISO8601().custom(value => {
    if (new Date(value) >= new Date()) {
      throw new Error('Date of birth must be in the past');
    }
    return true;
  })
];

const loginValidation = [
  body('user_id').trim().isLength({ min: 1 }),
  body('password').isLength({ min: 1 })
];

// @desc    Register user
// @route   POST /api/v1/auth/:role/signup
// @access  Public
router.post('/:role/signup', signupValidation, async (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    if (!['doctor', 'geneticist', 'pharmacologist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const UserModel = getModelByRole(role);
    const userData = { ...req.body };
    
    // Generate user ID
    const userIdField = `${role}_id`;
    userData[userIdField] = userData[userIdField] || `${role.toUpperCase()}${Date.now()}`;
    
    // Hash password
    userData.password_hash = userData.password;
    delete userData.password;
    delete userData.confirmPassword;

    // Create user
    const user = await UserModel.create(userData);

    logger.info(`New ${role} registered:`, {
      userId: user[userIdField],
      email: user.email,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      data: {
        user: {
          id: user._id,
          [userIdField]: user[userIdField],
          name: user.name,
          email: user.email,
          role
        }
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/:role/login
// @access  Public
router.post('/:role/login', loginValidation, async (req, res) => {
  try {
    const { role } = req.params;
    const { user_id, password } = req.body;

    // Validate role
    if (!['doctor', 'geneticist', 'pharmacologist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const UserModel = getModelByRole(role);
    const userIdField = `${role}_id`;

    // Find user by user_id
    const user = await UserModel.findOne({ [userIdField]: user_id }).select('+password_hash');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      role,
      user_id: user[userIdField]
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set cookies
    setTokenCookies(res, token, refreshToken);

    logger.info(`${role} logged in:`, {
      userId: user[userIdField],
      email: user.email,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Login successful',
      token, // Add token to response body for frontend
      data: {
        user: {
          id: user._id,
          [userIdField]: user[userIdField],
          name: user.name,
          email: user.email,
          role
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  clearTokenCookies(res);
  
  logger.info(`User logged out:`, {
    userId: req.user.user_id,
    role: req.user.role,
    correlationId: req.correlationId
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const UserModel = getModelByRole(req.user.role);
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          [`${req.user.role}_id`]: user[`${req.user.role}_id`],
          name: user.name,
          email: user.email,
          role: req.user.role,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
