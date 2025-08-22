const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const Report = require('../models/Report');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
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
const reportValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim()
];

// Apply auth and audit middleware
router.use(protect);
router.use(authorize('doctor', 'geneticist', 'pharmacologist'));
router.use(createAuditTrail('Report'));

// @desc    Get all reports
// @route   GET /api/v1/reports
// @access  Private (All roles)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('owner_role').optional().isIn(['doctor', 'geneticist', 'pharmacologist']),
  query('approved').optional().isBoolean()
], async (req, res) => {
  try {
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

    // Build query - users can only see their own reports
    let query = { 
      isActive: true,
      owner_role: req.user.role,
      owner_id: req.user.user_id
    };

    // Filter by owner_role (for admin use)
    if (req.query.owner_role) {
      query.owner_role = req.query.owner_role;
    }

    // Filter by approval status
    if (req.query.approved !== undefined) {
      query.approved = req.query.approved === 'true';
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
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single report
// @route   GET /api/v1/reports/:id
// @access  Private (All roles)
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ 
      report_id: req.params.id, 
      isActive: true,
      owner_role: req.user.role,
      owner_id: req.user.user_id
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
    logger.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create report
// @route   POST /api/v1/reports
// @access  Private (All roles)
router.post('/', upload.single('pdf_file'), reportValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reportData = {
      ...req.body,
      owner_role: req.user.role,
      owner_id: req.user.user_id
    };

    // Handle file upload if provided
    if (req.file) {
      reportData.pdf_file = {
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
        // Note: In a real implementation, you would save to GridFS or S3
        // and store the file ID or URL here
      };
    }

    const report = await Report.create(reportData);

    logger.info('Report created:', {
      reportId: report.report_id,
      title: report.title,
      createdBy: req.user.user_id,
      role: req.user.role,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: {
        report
      }
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update report
// @route   PUT /api/v1/reports/:id
// @access  Private (All roles)
router.put('/:id', upload.single('pdf_file'), reportValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing report
    const existingReport = await Report.findOne({ 
      report_id: req.params.id, 
      isActive: true,
      owner_role: req.user.role,
      owner_id: req.user.user_id
    });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if report is already approved
    if (existingReport.approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update approved report'
      });
    }

    // Store original for audit
    req.originalResource = existingReport.toObject();

    const updateData = { ...req.body };

    // Handle file upload if provided
    if (req.file) {
      updateData.pdf_file = {
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const report = await Report.findOneAndUpdate(
      { 
        report_id: req.params.id, 
        owner_role: req.user.role,
        owner_id: req.user.user_id
      },
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Report updated:', {
      reportId: report.report_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report
      }
    });
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete report
// @route   DELETE /api/v1/reports/:id
// @access  Private (All roles)
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ 
      report_id: req.params.id, 
      isActive: true,
      owner_role: req.user.role,
      owner_id: req.user.user_id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if report is already approved
    if (report.approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved report'
      });
    }

    // Store original for audit
    req.originalResource = report.toObject();

    // Soft delete
    report.isActive = false;
    await report.save();

    logger.info('Report deleted:', {
      reportId: report.report_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Report deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
