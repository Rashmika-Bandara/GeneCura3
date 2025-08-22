const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  doctor_id: {
    type: String,
    required: [true, 'Doctor ID is required'],
    unique: true,
    match: [/^[A-Z0-9_-]{4,20}$/, 'Doctor ID must be 4-20 characters, alphanumeric with hyphens/underscores']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  licence_id: {
    type: String,
    required: [true, 'License ID is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile_number: {
    type: String,
    required: [true, 'Mobile number is required'],
    // Fixed regex to properly handle +1234567890 format
    match: [/^(\+\d{1,3})?[\d\s\-()]{10,15}$/, 'Please enter a valid mobile number']
  },
  specialization: {
    type: String,
    trim: true
  },
  qualifications: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [70, 'Experience cannot exceed 70 years']
  },
  hospital: {
    type: String,
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
doctorSchema.index({ doctor_id: 1 });
doctorSchema.index({ email: 1 });

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Remove sensitive data from JSON output
doctorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Doctor', doctorSchema);
