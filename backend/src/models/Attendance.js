const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
    default: 'Present'
  },
  workHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  location: {
    checkIn: {
      lat: Number,
      lng: Number
    },
    checkOut: {
      lat: Number,
      lng: Number
    }
  },
  notes: String,
  isRemote: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate work hours on checkout
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const hours = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workHours = Math.max(0, hours);
    
    // Calculate overtime (assuming 8 hour work day)
    if (hours > 8) {
      this.overtime = hours - 8;
    }
  }
  next();
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
