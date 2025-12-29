const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  reviewType: {
    type: String,
    enum: ['Quarterly', 'Half-Yearly', 'Annual', 'Probation', 'Project-Based'],
    default: 'Annual'
  },
  ratings: {
    workQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    productivity: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    teamwork: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    initiative: {
      type: Number,
      min: 1,
      max: 5
    },
    leadership: {
      type: Number,
      min: 1,
      max: 5
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  strengths: [String],
  areasForImprovement: [String],
  achievements: [String],
  goals: [{
    description: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Not Started'
    }
  }],
  comments: String,
  employeeComments: String,
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Completed', 'Acknowledged'],
    default: 'Draft'
  },
  acknowledgedDate: Date
}, {
  timestamps: true
});

// Calculate overall rating
performanceSchema.pre('save', function(next) {
  if (this.ratings) {
    const ratings = Object.values(this.ratings).filter(r => r !== undefined && r !== null);
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, val) => acc + val, 0);
      this.overallRating = Number((sum / ratings.length).toFixed(2));
    }
  }
  next();
});

module.exports = mongoose.model('Performance', performanceSchema);
