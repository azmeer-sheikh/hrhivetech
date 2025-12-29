const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private
exports.getPayrolls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, month, year, status } = req.query;
  
  let query = {};
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  if (month) {
    query.month = parseInt(month);
  }
  
  if (year) {
    query.year = parseInt(year);
  }
  
  if (status) {
    query.status = status;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const payrolls = await Payroll.find(query)
    .populate('employee', 'firstName lastName employeeCode department position')
    .sort({ year: -1, month: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Payroll.countDocuments(query);
  
  sendPaginatedResponse(res, payrolls, page, limit, total);
});

// @desc    Get single payroll
// @route   GET /api/payroll/:id
// @access  Private
exports.getPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department position salary');

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc    Create payroll
// @route   POST /api/payroll
// @access  Private (admin, hr)
exports.createPayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;

  // Check if payroll already exists
  const existingPayroll = await Payroll.findOne({
    employee: employeeId,
    month,
    year
  });

  if (existingPayroll) {
    return res.status(400).json({
      success: false,
      message: 'Payroll for this month already exists'
    });
  }

  // Get employee data
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Calculate attendance-based salary (optional)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendance = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate }
  });

  const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const totalOvertimeHours = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

  const payrollData = {
    ...req.body,
    employee: employeeId,
    baseSalary: req.body.baseSalary || employee.salary,
    workingDays: new Date(year, month, 0).getDate(),
    presentDays,
    absentDays: attendance.filter(a => a.status === 'Absent').length,
    leaveDays: attendance.filter(a => a.status === 'On Leave').length,
    overtime: {
      hours: totalOvertimeHours,
      rate: req.body.overtimeRate || 0,
      amount: 0
    }
  };

  const payroll = await Payroll.create(payrollData);

  res.status(201).json({
    success: true,
    data: payroll
  });
});

// @desc    Update payroll
// @route   PUT /api/payroll/:id
// @access  Private (admin, hr)
exports.updatePayroll = asyncHandler(async (req, res) => {
  let payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  if (payroll.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update paid payroll'
    });
  }

  payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc    Delete payroll
// @route   DELETE /api/payroll/:id
// @access  Private (admin, hr)
exports.deletePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  if (payroll.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete paid payroll'
    });
  }

  await payroll.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Payroll record deleted successfully'
  });
});

// @desc    Process payroll (mark as paid)
// @route   PATCH /api/payroll/:id/process
// @access  Private (admin, hr)
exports.processPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  if (payroll.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'Payroll already paid'
    });
  }

  payroll.status = 'Paid';
  payroll.paymentDate = Date.now();
  
  await payroll.save();

  res.status(200).json({
    success: true,
    data: payroll
  });
});

// @desc    Get payroll summary
// @route   GET /api/payroll/summary/stats
// @access  Private
exports.getPayrollSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  const payrolls = await Payroll.find({
    month: currentMonth,
    year: currentYear
  });

  const summary = {
    totalEmployees: payrolls.length,
    totalPayroll: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
    totalAllowances: payrolls.reduce((sum, p) => sum + p.totalAllowances, 0),
    totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
    totalOvertime: payrolls.reduce((sum, p) => sum + (p.overtime?.amount || 0), 0),
    totalBonus: payrolls.reduce((sum, p) => sum + p.bonus, 0),
    paid: payrolls.filter(p => p.status === 'Paid').length,
    pending: payrolls.filter(p => p.status !== 'Paid').length
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});
