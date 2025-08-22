const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescription_id: {
    type: String,
    unique: true,
    default: function() {
      return 'PRESC' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  patient_id: {
    type: String,
    required: [true, 'Patient ID is required'],
    ref: 'Patient'
  },
  medicine_id: {
    type: String,
    required: [true, 'Medicine ID is required'],
    ref: 'Medicine'
  },
  special_notes: {
    type: String,
    trim: true
  },
  created_by_doctor_id: {
    type: String,
    required: [true, 'Creating doctor ID is required'],
    ref: 'Doctor'
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
prescriptionSchema.index({ prescription_id: 1 });
prescriptionSchema.index({ patient_id: 1 });
prescriptionSchema.index({ medicine_id: 1 });
prescriptionSchema.index({ created_by_doctor_id: 1 });

// Compound index for unique patient-medicine combination per doctor
prescriptionSchema.index(
  { patient_id: 1, medicine_id: 1, created_by_doctor_id: 1 },
  { unique: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
