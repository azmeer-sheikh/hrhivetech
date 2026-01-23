const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'IT', 'Customer Support', 'Other']
  },
  position: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time'
  },
  joiningDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date
  },
  salary: {
    type: Number,
    required: true
  },
  salaryType: {
    type: String,
    enum: ['Hourly', 'Monthly', 'Annual'],
    default: 'Monthly'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  skills: [String],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  notes: String
}, {
  timestamps: true
});

// Generate employee code before saving
employeeSchema.pre('save', async function(next) {
  if (!this.employeeCode) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeCode = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ createdAt: -1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
