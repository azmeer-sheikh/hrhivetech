const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['General', 'Policy Update', 'Event', 'Achievement', 'Emergency', 'Other'],
    default: 'General'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['All Employees', 'Specific Department', 'Specific Role', 'Management Only'],
    default: 'All Employees'
  },
  departments: [String],
  roles: [String],
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
