const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const Report = require('../models/Report');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for admin file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Validation rules
const decisionValidation = [
  body('final_decision').trim().isLength({ min: 1, max: 1000 }),
  body('approved').isBoolean()
];

// Apply auth middleware - only heads/admin can access
router.use(protect);
// Note: In a real implementation, you would have a separate admin role
// For now, we'll allow all roles but implement head logic in the routes
router.use(createAuditTrail('Report'));

// @desc    Get all reports for admin review
// @route   GET /api/v1/admin/reports
// @access  Private (Heads/Admin only)
router.get('/reports', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('owner_role').optional().isIn(['doctor', 'geneticist', 'pharmacologist']),
  query('approved').optional().isBoolean(),
  query('pending').optional().isBoolean()
], async (req, res) => {
  try {
    // Check if user is a head (in a real implementation, you'd have proper head roles)
    // For now, we'll allow all authenticated users to view all reports
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query - admin can see all reports
    let query = { isActive: true };

    // Filter by owner_role
    if (req.query.owner_role) {
      query.owner_role = req.query.owner_role;
    }

    // Filter by approval status
    if (req.query.approved !== undefined) {
      query.approved = req.query.approved === 'true';
    }

    // Filter for pending reports
    if (req.query.pending === 'true') {
      query.approved = false;
      query.final_decision = { $exists: false };
    }

    // Execute query
    const reports = await Report.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        reports
      }
    });
  } catch (error) {
    logger.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single report for admin review
// @route   GET /api/v1/admin/reports/:id
// @access  Private (Heads/Admin only)
router.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ 
      report_id: req.params.id, 
      isActive: true
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    logger.error('Get admin report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Make decision on report (approve/reject)
// @route   POST /api/v1/admin/reports/:id/decision
// @access  Private (Heads/Admin only)
router.post('/reports/:id/decision', upload.single('admin_pdf_file'), decisionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find the report
    const report = await Report.findOne({ 
      report_id: req.params.id, 
      isActive: true
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Store original for audit
    req.originalResource = report.toObject();

    // Update report with decision
    const updateData = {
      final_decision: req.body.final_decision,
      approved: req.body.approved,
      reviewed_by: req.user.user_id,
      reviewed_at: new Date()
    };

    // Handle admin PDF file if provided
    if (req.file) {
      updateData.admin_pdf_file = {
        filename: `admin-${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
        // Note: In a real implementation, you would save to GridFS or S3
      };
    }

    const updatedReport = await Report.findOneAndUpdate(
      { report_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Report decision made:', {
      reportId: updatedReport.report_id,
      decision: req.body.approved ? 'approved' : 'rejected',
      reviewedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: `Report ${req.body.approved ? 'approved' : 'rejected'} successfully`,
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    logger.error('Report decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get dashboard statistics for admin
// @route   GET /api/v1/admin/stats
// @access  Private (Heads/Admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total reports by status
      Report.countDocuments({ isActive: true, approved: true }),
      Report.countDocuments({ isActive: true, approved: false }),
      Report.countDocuments({ 
        isActive: true, 
        approved: false, 
        final_decision: { $exists: false } 
      }),
      
      // Reports by role
      Report.countDocuments({ isActive: true, owner_role: 'doctor' }),
      Report.countDocuments({ isActive: true, owner_role: 'geneticist' }),
      Report.countDocuments({ isActive: true, owner_role: 'pharmacologist' }),
    ]);

    res.json({
      success: true,
      data: {
        reports: {
          approved: stats[0],
          rejected: stats[1],
          pending: stats[2],
          total: stats[0] + stats[1],
          byRole: {
            doctor: stats[3],
            geneticist: stats[4],
            pharmacologist: stats[5]
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
