const express = require('express');
const { body, query, validationResult } = require('express-validator');
const TreatmentCase = require('../models/TreatmentCase');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const treatmentCaseValidation = [
  body('gene_id').optional().trim(),
  body('medicine_id').optional().trim(),
  body('doctor_id').optional().trim(),
  body('pharmacologist_id').optional().trim(),
  body('geneticist_id').optional().trim(),
  body('effectiveness').optional().isFloat({ min: 0, max: 100 }),
  body('treatment_time').optional().isFloat({ min: 0 }),
  body('patient_gender').optional().isIn(['male', 'female', 'other']),
  body('patient_age').optional().isInt({ min: 0, max: 150 })
];

// Apply auth middleware
router.use(protect);
router.use(authorize('doctor', 'geneticist', 'pharmacologist'));
router.use(createAuditTrail('TreatmentCase'));

// @desc    Get all treatment cases
// @route   GET /api/v1/treatment-cases
// @access  Private (All roles - read only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('gene_id').optional().trim(),
  query('medicine_id').optional().trim(),
  query('doctor_id').optional().trim(),
  query('pharmacologist_id').optional().trim(),
  query('geneticist_id').optional().trim(),
  query('effectiveness_gte').optional().isFloat({ min: 0, max: 100 }),
  query('effectiveness_lte').optional().isFloat({ min: 0, max: 100 }),
  query('patient_age_gte').optional().isInt({ min: 0, max: 150 }),
  query('patient_age_lte').optional().isInt({ min: 0, max: 150 }),
  query('patient_gender').optional().isIn(['male', 'female', 'other']),
  query('export').optional().isIn(['csv'])
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

    // Build query
    let query = { isActive: true };

    // Filter by gene_id
    if (req.query.gene_id) {
      query.gene_id = req.query.gene_id;
    }

    // Filter by medicine_id
    if (req.query.medicine_id) {
      query.medicine_id = req.query.medicine_id;
    }

    // Filter by doctor_id
    if (req.query.doctor_id) {
      query.doctor_id = req.query.doctor_id;
    }

    // Filter by pharmacologist_id
    if (req.query.pharmacologist_id) {
      query.pharmacologist_id = req.query.pharmacologist_id;
    }

    // Filter by geneticist_id
    if (req.query.geneticist_id) {
      query.geneticist_id = req.query.geneticist_id;
    }

    // Filter by effectiveness range
    if (req.query.effectiveness_gte || req.query.effectiveness_lte) {
      query.effectiveness = {};
      if (req.query.effectiveness_gte) {
        query.effectiveness.$gte = parseFloat(req.query.effectiveness_gte);
      }
      if (req.query.effectiveness_lte) {
        query.effectiveness.$lte = parseFloat(req.query.effectiveness_lte);
      }
    }

    // Filter by patient age range
    if (req.query.patient_age_gte || req.query.patient_age_lte) {
      query.patient_age = {};
      if (req.query.patient_age_gte) {
        query.patient_age.$gte = parseInt(req.query.patient_age_gte);
      }
      if (req.query.patient_age_lte) {
        query.patient_age.$lte = parseInt(req.query.patient_age_lte);
      }
    }

    // Filter by patient gender
    if (req.query.patient_gender) {
      query.patient_gender = req.query.patient_gender;
    }

    // Handle CSV export
    if (req.query.export === 'csv') {
      const allCases = await TreatmentCase.find(query).sort({ createdAt: -1 });
      
      // Generate CSV content
      const csvHeaders = [
        'case_id', 'gene_id', 'medicine_id', 'doctor_id', 
        'pharmacologist_id', 'geneticist_id', 'effectiveness', 
        'treatment_time', 'patient_gender', 'patient_age', 'created_at'
      ];
      
      const csvRows = allCases.map(case_ => [
        case_.case_id,
        case_.gene_id || '',
        case_.medicine_id || '',
        case_.doctor_id || '',
        case_.pharmacologist_id || '',
        case_.geneticist_id || '',
        case_.effectiveness || '',
        case_.treatment_time || '',
        case_.patient_gender || '',
        case_.patient_age || '',
        case_.createdAt?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="treatment_cases.csv"');
      return res.send(csvContent);
    }

    // Execute query for regular response
    const treatmentCases = await TreatmentCase.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await TreatmentCase.countDocuments(query);

    res.json({
      success: true,
      count: treatmentCases.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        treatmentCases
      }
    });
  } catch (error) {
    logger.error('Get treatment cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single treatment case
// @route   GET /api/v1/treatment-cases/:id
// @access  Private (All roles)
router.get('/:id', async (req, res) => {
  try {
    const treatmentCase = await TreatmentCase.findOne({ 
      case_id: req.params.id, 
      isActive: true
    });

    if (!treatmentCase) {
      return res.status(404).json({
        success: false,
        message: 'Treatment case not found'
      });
    }

    res.json({
      success: true,
      data: {
        treatmentCase
      }
    });
  } catch (error) {
    logger.error('Get treatment case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create treatment case
// @route   POST /api/v1/treatment-cases
// @access  Private (All roles)
router.post('/', treatmentCaseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const treatmentCase = await TreatmentCase.create(req.body);

    logger.info('Treatment case created:', {
      caseId: treatmentCase.case_id,
      createdBy: req.user.user_id,
      role: req.user.role,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Treatment case created successfully',
      data: {
        treatmentCase
      }
    });
  } catch (error) {
    logger.error('Create treatment case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update treatment case
// @route   PUT /api/v1/treatment-cases/:id
// @access  Private (All roles)
router.put('/:id', treatmentCaseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing treatment case
    const existingCase = await TreatmentCase.findOne({ 
      case_id: req.params.id, 
      isActive: true
    });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Treatment case not found'
      });
    }

    // Store original for audit
    req.originalResource = existingCase.toObject();

    const treatmentCase = await TreatmentCase.findOneAndUpdate(
      { case_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info('Treatment case updated:', {
      caseId: treatmentCase.case_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Treatment case updated successfully',
      data: {
        treatmentCase
      }
    });
  } catch (error) {
    logger.error('Update treatment case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete treatment case
// @route   DELETE /api/v1/treatment-cases/:id
// @access  Private (All roles)
router.delete('/:id', async (req, res) => {
  try {
    const treatmentCase = await TreatmentCase.findOne({ 
      case_id: req.params.id, 
      isActive: true
    });

    if (!treatmentCase) {
      return res.status(404).json({
        success: false,
        message: 'Treatment case not found'
      });
    }

    // Store original for audit
    req.originalResource = treatmentCase.toObject();

    // Soft delete
    treatmentCase.isActive = false;
    await treatmentCase.save();

    logger.info('Treatment case deleted:', {
      caseId: treatmentCase.case_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Treatment case deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete treatment case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
