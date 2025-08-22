const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  entity: {
    type: String,
    required: [true, 'Entity is required'],
    enum: ['Patient', 'Gene', 'Medicine', 'Report', 'Prescription', 'MetabolizerDetail', 'TreatmentCase']
  },
  entity_id: {
    type: String,
    required: [true, 'Entity ID is required']
  },
  actor_role: {
    type: String,
    required: [true, 'Actor role is required'],
    enum: ['doctor', 'geneticist', 'pharmacologist', 'admin']
  },
  actor_id: {
    type: String,
    required: [true, 'Actor ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'update', 'delete', 'approve', 'reject']
  },
  before: {
    type: mongoose.Schema.Types.Mixed
  },
  after: {
    type: mongoose.Schema.Types.Mixed
  },
  correlationId: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
auditSchema.index({ entity: 1, entity_id: 1 });
auditSchema.index({ actor_role: 1, actor_id: 1 });
auditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);
