const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  candidateEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  candidatePhone: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  interviewDate: {
    type: Date,
    required: true
  },
  interviewTime: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    enum: ['In-Person', 'Phone', 'Video Call', 'Technical', 'HR Round', 'Final Round'],
    default: 'In-Person'
  },
  interviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interviewerName: {
    type: String,
    trim: true
  },
  location: String,
  meetingLink: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
    default: 'Scheduled'
  },
  evaluation: {
    technicalSkills: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    },
    cultureFit: {
      type: Number,
      min: 1,
      max: 5
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  feedback: String,
  recommendation: {
    type: String,
    enum: ['Strongly Recommended', 'Recommended', 'Maybe', 'Not Recommended', 'Pending']
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],
  resume: String,
  experience: Number,
  expectedSalary: Number,
  noticePeriod: String,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
