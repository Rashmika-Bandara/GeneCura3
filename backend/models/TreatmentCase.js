const mongoose = require('mongoose');

const treatmentCaseSchema = new mongoose.Schema({
  case_id: {
    type: String,
    required: [true, 'Case ID is required'],
    unique: true,
    default: function() {
      return 'CASE' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  gene_id: {
    type: String,
    ref: 'Gene'
  },
  medicine_id: {
    type: String,
    ref: 'Medicine'
  },
  doctor_id: {
    type: String,
    ref: 'Doctor'
  },
  pharmacologist_id: {
    type: String,
    ref: 'Pharmacologist'
  },
  geneticist_id: {
    type: String,
    ref: 'Geneticist'
  },
  effectiveness: {
    type: Number,
    min: [0, 'Effectiveness cannot be negative'],
    max: [100, 'Effectiveness cannot exceed 100%']
  },
  treatment_time: {
    type: Number,
    min: [0, 'Treatment time cannot be negative']
  },
  patient_gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  patient_age: {
    type: Number,
    min: [0, 'Patient age cannot be negative'],
    max: [150, 'Patient age cannot exceed 150']
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
treatmentCaseSchema.index({ case_id: 1 });
treatmentCaseSchema.index({ gene_id: 1 });
treatmentCaseSchema.index({ medicine_id: 1 });
treatmentCaseSchema.index({ doctor_id: 1 });
treatmentCaseSchema.index({ effectiveness: 1 });
treatmentCaseSchema.index({ patient_age: 1 });
treatmentCaseSchema.index({ patient_gender: 1 });

module.exports = mongoose.model('TreatmentCase', treatmentCaseSchema);
