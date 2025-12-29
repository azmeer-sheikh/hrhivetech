const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['National Holiday', 'Regional Holiday', 'Company Holiday', 'Optional Holiday'],
    default: 'Company Holiday'
  },
  description: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  applicableFor: {
    type: String,
    enum: ['All', 'Specific Department', 'Specific Location'],
    default: 'All'
  },
  departments: [String],
  locations: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
