const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Gene = require('../models/Gene');
const Medicine = require('../models/Medicine');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const patientValidation = [
  body('patient_id').matches(/^[A-Z0-9_-]{4,20}$/),
  body('patient_name').trim().isLength({ min: 1, max: 100 }),
  body('mobile_number').optional().matches(/^(\+\d{1,3}[- ]?)?\d{10,15}$/),
  body('weight').optional().isFloat({ min: 1, max: 500 }),
  body('gene_id').optional().custom(async (value) => {
    if (value) {
      const gene = await Gene.findOne({ gene_id: value });
      if (!gene) {
        throw new Error('Invalid gene_id');
      }
    }
    return true;
  }),
  body('medicine_id').optional().custom(async (value) => {
    if (value) {
      const medicine = await Medicine.findOne({ medicine_id: value });
      if (!medicine) {
        throw new Error('Invalid medicine_id');
      }
    }
    return true;
  })
];

// Apply auth and audit middleware
router.use(protect);
router.use(authorize('doctor', 'admin', 'geneticist'));
router.use(createAuditTrail('Patient'));

// @desc    Get all patients
// @route   GET /api/v1/patients
// @access  Private (Doctor only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('gender').optional().isIn(['male', 'female', 'other'])
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
    
    // Only show patients created by this doctor
    query.created_by_doctor_id = req.user.user_id;

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { patient_name: { $regex: req.query.search, $options: 'i' } },
        { patient_id: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by gender
    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    // Execute query
    const patients = await Patient.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      count: patients.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        patients
      }
    });
  } catch (error) {
    logger.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single patient
// @route   GET /api/v1/patients/:id
// @access  Private (Doctor only)
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      patient_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    logger.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create patient
// @route   POST /api/v1/patients
// @access  Private (Doctor only)
router.post('/', patientValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const patientData = {
      ...req.body,
      created_by_doctor_id: req.user.user_id
    };

    // If gene_id is provided, populate gene_name
    if (patientData.gene_id) {
      const gene = await Gene.findOne({ gene_id: patientData.gene_id });
      if (gene) {
        patientData.gene_name = gene.gene_name;
      }
    }

    // If medicine_id is provided, populate medicine_name
    if (patientData.medicine_id) {
      const medicine = await Medicine.findOne({ medicine_id: patientData.medicine_id });
      if (medicine) {
        patientData.medicine_name = medicine.name;
      }
    }

    const patient = await Patient.create(patientData);

    logger.info('Patient created:', {
      patientId: patient.patient_id,
      createdBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: {
        patient
      }
    });
  } catch (error) {
    logger.error('Create patient error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update patient
// @route   PUT /api/v1/patients/:id
// @access  Private (Doctor only)
router.put('/:id', patientValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing patient
    const existingPatient = await Patient.findOne({ 
      patient_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Store original for audit
    req.originalResource = existingPatient.toObject();

    const updateData = { ...req.body };

    // If gene_id is provided, populate gene_name
    if (updateData.gene_id) {
      const gene = await Gene.findOne({ gene_id: updateData.gene_id });
      if (gene) {
        updateData.gene_name = gene.gene_name;
      }
    }

    // If medicine_id is provided, populate medicine_name
    if (updateData.medicine_id) {
      const medicine = await Medicine.findOne({ medicine_id: updateData.medicine_id });
      if (medicine) {
        updateData.medicine_name = medicine.name;
      }
    }

    const patient = await Patient.findOneAndUpdate(
      { patient_id: req.params.id, created_by_doctor_id: req.user.user_id },
      updateData,
      { new: true, runValidators: true }
    );

    logger.info('Patient updated:', {
      patientId: patient.patient_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        patient
      }
    });
  } catch (error) {
    logger.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete patient
// @route   DELETE /api/v1/patients/:id
// @access  Private (Doctor only)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      patient_id: req.params.id, 
      isActive: true,
      created_by_doctor_id: req.user.user_id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Store original for audit
    req.originalResource = patient.toObject();

    // Soft delete
    patient.isActive = false;
    await patient.save();

    logger.info('Patient deleted:', {
      patientId: patient.patient_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
