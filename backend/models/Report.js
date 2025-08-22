const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    unique: true,
    default: function() {
      return 'RPT' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }
  },
  owner_role: {
    type: String,
    required: [true, 'Owner role is required'],
    enum: ['doctor', 'geneticist', 'pharmacologist']
  },
  owner_id: {
    type: String,
    required: [true, 'Owner ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  pdf_file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    gridfsId: mongoose.Schema.Types.ObjectId
  },
  approved: {
    type: Boolean,
    default: false
  },
  final_decision: {
    type: String,
    trim: true
  },
  reviewed_by: {
    type: String,
    ref: 'User'
  },
  reviewed_at: {
    type: Date
  },
  admin_pdf_file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    gridfsId: mongoose.Schema.Types.ObjectId
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
reportSchema.index({ report_id: 1 });
reportSchema.index({ owner_role: 1, owner_id: 1 });
reportSchema.index({ approved: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
