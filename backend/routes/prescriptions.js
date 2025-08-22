const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const prescriptionValidation = [
  body('patient_id').trim().isLength({ min: 1 }).custom(async (value) => {
    const patient = await Patient.findOne({ patient_id: value });
    if (!patient) {
      throw new Error('Invalid patient_id');
    }
    return true;
  }),
  body('medicine_id').trim().isLength({ min: 1 }).custom(async (value) => {
    const medicine = await Medicine.findOne({ medicine_id: value });
    if (!medicine) {
      throw new Error('Invalid medicine_id');
    }
    return true;
  }),
  body('special_notes').optional().trim()
];

// Apply auth and audit middleware
router.use(protect);
router.use(authorize('doctor'));
router.use(createAuditTrail('Prescription'));

// @desc    Get all prescriptions
// @route   GET /api/v1/prescriptions
// @access  Private (Doctor only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('patient_id').optional().trim(),
  query('medicine_id').optional().trim()
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
    let query = { 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    };

    // Filter by patient_id
    if (req.query.patient_id) {
      query.patient_id = req.query.patient_id;
    }

    // Filter by medicine_id
    if (req.query.medicine_id) {
      query.medicine_id = req.query.medicine_id;
    }

    // Execute query
    const prescriptions = await Prescription.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      count: prescriptions.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        prescriptions
      }
    });
  } catch (error) {
    logger.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single prescription
// @route   GET /api/v1/prescriptions/:id
// @access  Private (Doctor only)
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ 
      prescription_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: {
        prescription
      }
    });
  } catch (error) {
    logger.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create prescription
// @route   POST /api/v1/prescriptions
// @access  Private (Doctor only)
router.post('/', prescriptionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if patient belongs to this doctor
    const patient = await Patient.findOne({
      patient_id: req.body.patient_id,
      created_by_doctor_id: req.user.user_id,
      isActive: true
    });

    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for your own patients'
      });
    }

    const prescriptionData = {
      ...req.body,
      created_by_doctor_id: req.user.user_id
    };

    const prescription = await Prescription.create(prescriptionData);

    logger.info('Prescription created:', {
      prescriptionId: prescription.prescription_id,
      patientId: prescription.patient_id,
      medicineId: prescription.medicine_id,
      createdBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription
      }
    });
  } catch (error) {
    logger.error('Create prescription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Prescription for this patient-medicine combination already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update prescription
// @route   PUT /api/v1/prescriptions/:id
// @access  Private (Doctor only)
router.put('/:id', prescriptionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing prescription
    const existingPrescription = await Prescription.findOne({ 
      prescription_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!existingPrescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if patient belongs to this doctor
    const patient = await Patient.findOne({
      patient_id: req.body.patient_id,
      created_by_doctor_id: req.user.user_id,
      isActive: true
    });

    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'You can only update prescriptions for your own patients'
      });
    }

    // Store original for audit
    req.originalResource = existingPrescription.toObject();

    const prescription = await Prescription.findOneAndUpdate(
      { prescription_id: req.params.id, created_by_doctor_id: req.user.user_id },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info('Prescription updated:', {
      prescriptionId: prescription.prescription_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription
      }
    });
  } catch (error) {
    logger.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete prescription
// @route   DELETE /api/v1/prescriptions/:id
// @access  Private (Doctor only)
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ 
      prescription_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Store original for audit
    req.originalResource = prescription.toObject();

    // Soft delete
    prescription.isActive = false;
    await prescription.save();

    logger.info('Prescription deleted:', {
      prescriptionId: prescription.prescription_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Prescription deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
