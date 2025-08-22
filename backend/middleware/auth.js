const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Geneticist = require('../models/Geneticist');
const Pharmacologist = require('../models/Pharmacologist');
const logger = require('../utils/logger');

// Get model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'doctor':
      return Doctor;
    case 'geneticist':
      return Geneticist;
    case 'pharmacologist':
      return Pharmacologist;
    default:
      return null;
  }
};

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user model based on role
      const UserModel = getModelByRole(decoded.role);
      if (!UserModel) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user role'
        });
      }

      // Get user from database
      const user = await UserModel.findById(decoded.id).select('+password_hash');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Add user to request
      req.user = {
        id: user._id,
        role: decoded.role,
        user_id: user[`${decoded.role}_id`],
        email: user.email,
        name: user.name
      };

      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const checkOwnership = (ownerField = 'created_by_doctor_id') => {
  return (req, res, next) => {
    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    // For routes with resource ID in params
    if (req.resource && req.resource[ownerField] !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  getModelByRole
};
