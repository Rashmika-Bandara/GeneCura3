const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: [true, 'Patient ID is required'],
    unique: true,
    match: [/^[A-Z0-9_-]{4,20}$/, 'Patient ID must be 4-20 characters, alphanumeric with hyphens/underscores']
  },
  patient_name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: [100, 'Patient name cannot exceed 100 characters']
  },
  gene_id: {
    type: String,
    ref: 'Gene'
  },
  gene_name: {
    type: String,
    trim: true
  },
  drug_reaction_history: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: [1, 'Weight must be at least 1kg'],
    max: [500, 'Weight must be less than 500kg']
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    province: {
      type: String,
      trim: true
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  health_condition: {
    type: String,
    trim: true
  },
  current_medication: {
    type: String,
    trim: true
  },
  mobile_number: {
    type: String,
    // Fixed regex to properly handle +1234567890 format
    match: [/^(\+\d{1,3})?[\d\s\-()]{10,15}$/, 'Please enter a valid mobile number']
  },
  allergies: {
    type: String,
    trim: true
  },
  medicine_id: {
    type: String,
    ref: 'Medicine'
  },
  medicine_name: {
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
patientSchema.index({ patient_id: 1 });
patientSchema.index({ created_by_doctor_id: 1 });
patientSchema.index({ gene_id: 1 });
patientSchema.index({ medicine_id: 1 });

// Validate address fields together
patientSchema.pre('save', function(next) {
  if (this.address && (this.address.street || this.address.city || this.address.province)) {
    if (!this.address.street || !this.address.city || !this.address.province) {
      return next(new Error('All address fields (street, city, province) are required when providing address'));
    }
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
