const mongoose = require('mongoose');

const geneSchema = new mongoose.Schema({
  gene_id: {
    type: String,
    required: [true, 'Gene ID is required'],
    unique: true,
    match: [/^[A-Z0-9_-]{4,20}$/, 'Gene ID must be 4-20 characters, alphanumeric with hyphens/underscores']
  },
  gene_name: {
    type: String,
    required: [true, 'Gene name is required'],
    trim: true,
    maxlength: [100, 'Gene name cannot exceed 100 characters']
  },
  genetic_variant_type: {
    type: String,
    trim: true
  },
  metabolizer_status: {
    type: String,
    enum: ['poor', 'normal', 'rapid', 'ultra-rapid'],
    lowercase: true
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
geneSchema.index({ gene_id: 1 });
geneSchema.index({ gene_name: 1 });

// Ensure gene_name is unique (case-insensitive)
geneSchema.index({ gene_name: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 }
});

module.exports = mongoose.model('Gene', geneSchema);
