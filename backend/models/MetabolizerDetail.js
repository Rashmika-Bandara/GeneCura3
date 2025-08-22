const mongoose = require('mongoose');

const metabolizerDetailSchema = new mongoose.Schema({
  metabolizer_id: {
    type: String,
    unique: true,
    default: function() {
      return 'MET' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  gene_id: {
    type: String,
    required: [true, 'Gene ID is required'],
    ref: 'Gene'
  },
  status_label: {
    type: String,
    required: [true, 'Status label is required'],
    enum: ['poor', 'normal', 'rapid', 'ultra-rapid'],
    lowercase: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
metabolizerDetailSchema.index({ metabolizer_id: 1 });
metabolizerDetailSchema.index({ gene_id: 1 });

module.exports = mongoose.model('MetabolizerDetail', metabolizerDetailSchema);
