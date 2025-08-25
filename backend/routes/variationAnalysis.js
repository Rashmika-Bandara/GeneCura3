const express = require('express');
const router = express.Router();
const VariationAnalysis = require('../models/VariationAnalysis');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes and allow only pharmacologist
router.use(protect);
router.use(authorize('pharmacologist'));

// Create a new variation analysis report
router.post('/', async (req, res) => {
  try {
    const { medicine_id, description } = req.body;
    if (!medicine_id || !description) {
      return res.status(400).json({ success: false, message: 'medicine_id and description are required.' });
    }
    const report = await VariationAnalysis.create({ medicine_id, description });
    res.status(201).json({ success: true, data: { report } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reports, optionally filter by medicine_id
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.medicine_id) query.medicine_id = req.query.medicine_id;
    const reports = await VariationAnalysis.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: { reports } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
