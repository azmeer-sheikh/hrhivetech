const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  documentType: {
    type: String,
    required: true,
    enum: [
      'Contract',
      'Policy',
      'Certificate',
      'ID Proof',
      'Educational Certificate',
      'Offer Letter',
      'Resignation Letter',
      'Experience Letter',
      'Salary Slip',
      'Tax Document',
      'Performance Review',
      'Other'
    ]
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Archived'],
    default: 'Active'
  },
  tags: [String],
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    fileUrl: String,
    uploadDate: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
