const Employee = require('../models/Employee');
const User = require('../models/User');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');
const sendEmail = require('../utils/sendEmail');
const generateWelcomeEmail = require('../utils/emailTemplates/welcomeTemplate');
const { addEmailJob } = require('../utils/emailJobQueue');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department, status } = req.query;
  
  // Build query
  let query = {};
  
  if (search) {
    // Keyword search across common employee fields
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (department) {
    query.department = department;
  }
  
  if (status) {
    query.status = status;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const employees = await Employee.find(query)
    .populate('manager', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Employee.countDocuments(query);
  
  sendPaginatedResponse(res, employees, page, limit, total);
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('manager', 'firstName lastName email position')
    .populate('documents');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (admin, hr)
exports.createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);

  // Optionally create user account for employee
  if (req.body.createUserAccount) {
    const user = await User.create({
      username: req.body.email.split('@')[0],
      email: req.body.email,
      password: req.body.password || 'default123',
      role: 'employee',
      employeeId: employee._id
    });

    employee.userId = user._id;
    await employee.save();
  }

  // Send welcome email (queue in dev, send immediately in production unless ENABLE_EMAIL_QUEUE=true)
  let emailStatus = 'Email sending in progress';
  try {
    const welcomeEmailHtml = generateWelcomeEmail(employee);
    const emailOptions = {
      email: employee.email,
      subject: `Welcome to ${process.env.FROM_NAME || 'Our Company'}!`,
      html: welcomeEmailHtml,
      message: `Welcome ${employee.firstName} ${employee.lastName}! We're excited to have you join our team.`
    };

    const shouldQueue = process.env.ENABLE_EMAIL_QUEUE === 'true';
    const isProduction = process.env.NODE_ENV === 'production';

    if (shouldQueue && !isProduction) {
      const jobId = addEmailJob(emailOptions, 30, `welcome-${employee._id}`);
      console.log(`✓ Welcome email queued for ${employee.email} (Job ID: ${jobId})`);
      emailStatus = 'Welcome email queued successfully';
    } else {
      // Send immediately in production or when queue is disabled
      console.log(`📧 Attempting to send welcome email to ${employee.email}...`);
      const emailResult = await sendEmail(emailOptions);
      console.log(`✅ Welcome email sent successfully to ${employee.email}`, emailResult.messageId);
      emailStatus = 'Welcome email sent successfully';
    }
  } catch (error) {
    console.error('❌ FAILED to send welcome email:', {
      employee: employee.email,
      errorMessage: error.message,
      errorStack: error.stack
    });
    emailStatus = 'Email sending failed - employee created successfully';
    // Don't fail the employee creation if email sending fails
  }

  res.status(201).json({
    success: true,
    data: employee,
    message: `Employee created successfully. ${emailStatus}`
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (admin, hr)
exports.updateEmployee = asyncHandler(async (req, res) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (admin, hr)
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  await employee.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully'
  });
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Private
exports.getEmployeeStats = asyncHandler(async (req, res) => {
  const totalEmployees = await Employee.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: 'Active' });
  const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });
  const onLeaveEmployees = await Employee.countDocuments({ status: 'On Leave' });

  // Department-wise count
  const departmentStats = await Employee.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  // Employment type stats
  const employmentTypeStats = await Employee.aggregate([
    {
      $group: {
        _id: '$employmentType',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
      onLeave: onLeaveEmployees,
      byDepartment: departmentStats,
      byEmploymentType: employmentTypeStats
    }
  });
});
