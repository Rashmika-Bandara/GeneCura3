const mongoose = require('mongoose');

const variationAnalysisSchema = new mongoose.Schema({
  analysis_report_id: {
    type: String,
    unique: true,
    default: function() {
      return 'VAR' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  medicine_id: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('VariationAnalysis', variationAnalysisSchema);
