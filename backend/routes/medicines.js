const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Medicine = require('../models/Medicine');
const Audit = require('../models/Audit');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const medicineValidation = [
  body('medicine_id').matches(/^[A-Z0-9_-]{4,20}$/),
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('purpose').optional().trim(),
  body('drug_interactions').optional().trim(),
  body('allergy_risks').optional().trim()
];

// Apply auth and audit middleware
router.use(protect);
router.use(authorize('pharmacologist'));
router.use(createAuditTrail('Medicine'));

// @desc    Get all medicines
// @route   GET /api/v1/medicines
// @access  Private (Pharmacologist only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
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

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { medicine_id: { $regex: req.query.search, $options: 'i' } },
        { purpose: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute query
    const medicines = await Medicine.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments(query);

    res.json({
      success: true,
      count: medicines.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        medicines
      }
    });
  } catch (error) {
    logger.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single medicine
// @route   GET /api/v1/medicines/:id
// @access  Private (Pharmacologist only)
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ 
      medicine_id: req.params.id, 
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: {
        medicine
      }
    });
  } catch (error) {
    logger.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create medicine
// @route   POST /api/v1/medicines
// @access  Private (Pharmacologist only)
router.post('/', medicineValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const medicine = await Medicine.create(req.body);

    logger.info('Medicine created:', {
      medicineId: medicine.medicine_id,
      createdBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    logger.error('Create medicine error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update medicine
// @route   PUT /api/v1/medicines/:id
// @access  Private (Pharmacologist only)
router.put('/:id', medicineValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing medicine
    const existingMedicine = await Medicine.findOne({ 
      medicine_id: req.params.id, 
      isActive: true
    });

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Store original for audit
    req.originalResource = existingMedicine.toObject();

    const medicine = await Medicine.findOneAndUpdate(
      { medicine_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info('Medicine updated:', {
      medicineId: medicine.medicine_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    logger.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete medicine
// @route   DELETE /api/v1/medicines/:id
// @access  Private (Pharmacologist only)
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ 
      medicine_id: req.params.id, 
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Store original for audit
    req.originalResource = medicine.toObject();

    // Soft delete
    medicine.isActive = false;
    await medicine.save();

    logger.info('Medicine deleted:', {
      medicineId: medicine.medicine_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get drug variation analysis (audit timeline)
// @route   GET /api/v1/medicines/:id/variation
// @access  Private (Pharmacologist only)
router.get('/:id/variation', async (req, res) => {
  try {
    // Check if medicine exists
    const medicine = await Medicine.findOne({ 
      medicine_id: req.params.id, 
      isActive: true
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Get audit trail for this medicine
    const auditTrail = await Audit.find({
      entity: 'Medicine',
      entity_id: req.params.id
    }).sort({ createdAt: -1 });

    // Format audit trail for drug variation analysis
    const variations = auditTrail.map(audit => ({
      timestamp: audit.createdAt,
      action: audit.action,
      actor: {
        role: audit.actor_role,
        id: audit.actor_id
      },
      changes: {
        before: audit.before,
        after: audit.after
      },
      correlationId: audit.correlationId
    }));

    res.json({
      success: true,
      data: {
        medicine,
        variations,
        totalVariations: variations.length
      }
    });
  } catch (error) {
    logger.error('Get drug variation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
