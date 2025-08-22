const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Gene = require('../models/Gene');
const MetabolizerDetail = require('../models/MetabolizerDetail');
const { protect, authorize } = require('../middleware/auth');
const { createAuditTrail } = require('../middleware/audit');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const geneValidation = [
  body('gene_id').matches(/^[A-Z0-9_-]{4,20}$/),
  body('gene_name').trim().isLength({ min: 1, max: 100 }),
  body('metabolizer_status').optional().isIn(['poor', 'normal', 'rapid', 'ultra-rapid'])
];

const metabolizerValidation = [
  body('status_label').isIn(['poor', 'normal', 'rapid', 'ultra-rapid']),
  body('notes').optional().trim()
];

// Apply auth and audit middleware
router.use(protect);
router.use(authorize('geneticist'));
router.use(createAuditTrail('Gene'));

// @desc    Get all genes
// @route   GET /api/v1/genes
// @access  Private (Geneticist only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('metabolizer_status').optional().isIn(['poor', 'normal', 'rapid', 'ultra-rapid'])
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
        { gene_name: { $regex: req.query.search, $options: 'i' } },
        { gene_id: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by metabolizer status
    if (req.query.metabolizer_status) {
      query.metabolizer_status = req.query.metabolizer_status;
    }

    // Execute query
    const genes = await Gene.find(query)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    const total = await Gene.countDocuments(query);

    res.json({
      success: true,
      count: genes.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        genes
      }
    });
  } catch (error) {
    logger.error('Get genes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single gene
// @route   GET /api/v1/genes/:id
// @access  Private (Geneticist only)
router.get('/:id', async (req, res) => {
  try {
    const gene = await Gene.findOne({ 
      gene_id: req.params.id, 
      isActive: true
    });

    if (!gene) {
      return res.status(404).json({
        success: false,
        message: 'Gene not found'
      });
    }

    // Get metabolizer details for this gene
    const metabolizerDetails = await MetabolizerDetail.find({
      gene_id: req.params.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        gene,
        metabolizerDetails
      }
    });
  } catch (error) {
    logger.error('Get gene error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create gene
// @route   POST /api/v1/genes
// @access  Private (Geneticist only)
router.post('/', geneValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const gene = await Gene.create(req.body);

    logger.info('Gene created:', {
      geneId: gene.gene_id,
      createdBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Gene created successfully',
      data: {
        gene
      }
    });
  } catch (error) {
    logger.error('Create gene error:', error);
    
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

// @desc    Update gene
// @route   PUT /api/v1/genes/:id
// @access  Private (Geneticist only)
router.put('/:id', geneValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find existing gene
    const existingGene = await Gene.findOne({ 
      gene_id: req.params.id, 
      isActive: true
    });

    if (!existingGene) {
      return res.status(404).json({
        success: false,
        message: 'Gene not found'
      });
    }

    // Store original for audit
    req.originalResource = existingGene.toObject();

    const gene = await Gene.findOneAndUpdate(
      { gene_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info('Gene updated:', {
      geneId: gene.gene_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Gene updated successfully',
      data: {
        gene
      }
    });
  } catch (error) {
    logger.error('Update gene error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete gene
// @route   DELETE /api/v1/genes/:id
// @access  Private (Geneticist only)
router.delete('/:id', async (req, res) => {
  try {
    const gene = await Gene.findOne({ 
      gene_id: req.params.id, 
      isActive: true
    });

    if (!gene) {
      return res.status(404).json({
        success: false,
        message: 'Gene not found'
      });
    }

    // Store original for audit
    req.originalResource = gene.toObject();

    // Soft delete
    gene.isActive = false;
    await gene.save();

    // Also soft delete associated metabolizer details
    await MetabolizerDetail.updateMany(
      { gene_id: req.params.id },
      { isActive: false }
    );

    logger.info('Gene deleted:', {
      geneId: gene.gene_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Gene deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete gene error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add metabolizer detail to gene
// @route   POST /api/v1/genes/:id/metabolizers
// @access  Private (Geneticist only)
router.post('/:id/metabolizers', metabolizerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if gene exists
    const gene = await Gene.findOne({ 
      gene_id: req.params.id, 
      isActive: true
    });

    if (!gene) {
      return res.status(404).json({
        success: false,
        message: 'Gene not found'
      });
    }

    const metabolizerData = {
      ...req.body,
      gene_id: req.params.id
    };

    const metabolizer = await MetabolizerDetail.create(metabolizerData);

    logger.info('Metabolizer detail created:', {
      metabolizerId: metabolizer.metabolizer_id,
      geneId: req.params.id,
      createdBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Metabolizer detail created successfully',
      data: {
        metabolizer
      }
    });
  } catch (error) {
    logger.error('Create metabolizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update metabolizer detail
// @route   PUT /api/v1/genes/metabolizers/:id
// @access  Private (Geneticist only)
router.put('/metabolizers/:id', metabolizerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const existingMetabolizer = await MetabolizerDetail.findOne({
      metabolizer_id: req.params.id,
      isActive: true
    });

    if (!existingMetabolizer) {
      return res.status(404).json({
        success: false,
        message: 'Metabolizer detail not found'
      });
    }

    // Store original for audit
    req.originalResource = existingMetabolizer.toObject();

    const metabolizer = await MetabolizerDetail.findOneAndUpdate(
      { metabolizer_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info('Metabolizer detail updated:', {
      metabolizerId: metabolizer.metabolizer_id,
      updatedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Metabolizer detail updated successfully',
      data: {
        metabolizer
      }
    });
  } catch (error) {
    logger.error('Update metabolizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete metabolizer detail
// @route   DELETE /api/v1/genes/metabolizers/:id
// @access  Private (Geneticist only)
router.delete('/metabolizers/:id', async (req, res) => {
  try {
    const metabolizer = await MetabolizerDetail.findOne({
      metabolizer_id: req.params.id,
      isActive: true
    });

    if (!metabolizer) {
      return res.status(404).json({
        success: false,
        message: 'Metabolizer detail not found'
      });
    }

    // Store original for audit
    req.originalResource = metabolizer.toObject();

    // Soft delete
    metabolizer.isActive = false;
    await metabolizer.save();

    logger.info('Metabolizer detail deleted:', {
      metabolizerId: metabolizer.metabolizer_id,
      deletedBy: req.user.user_id,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Metabolizer detail deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error('Delete metabolizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/', async (req, res) => {
  const { gene_id, gene_name, genetic_variant_type, metabolizer_status, isActive } = req.body;

  try {
    // Validate the data (basic checks)
    if (!gene_id || !gene_name || !genetic_variant_type || !metabolizer_status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new Gene instance
    const newGene = new Gene({
      gene_id,
      gene_name,
      genetic_variant_type,
      metabolizer_status,
      isActive,
    });

    // Save the new gene to the database
    await newGene.save();

    // Respond with the saved gene data
    res.status(201).json({
      message: 'Gene added successfully',
      data: newGene,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
