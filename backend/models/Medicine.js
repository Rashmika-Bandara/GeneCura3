const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicine_id: {
    type: String,
    required: [true, 'Medicine ID is required'],
    unique: true,
    match: [/^[A-Z0-9_-]{4,20}$/, 'Medicine ID must be 4-20 characters, alphanumeric with hyphens/underscores']
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  purpose: {
    type: String,
    trim: true
  },
  drug_interactions: {
    type: String,
    trim: true
  },
  allergy_risks: {
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
medicineSchema.index({ medicine_id: 1 });
medicineSchema.index({ name: 1 });

// Ensure medicine name is unique (case-insensitive)
medicineSchema.index({ name: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 }
});

module.exports = mongoose.model('Medicine', medicineSchema);
