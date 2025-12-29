const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');
const moment = require('moment');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, startDate, endDate, status } = req.query;
  
  let query = {};
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  if (status) {
    query.status = status;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const attendance = await Attendance.find(query)
    .populate('employee', 'firstName lastName employeeCode department')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Attendance.countDocuments(query);
  
  sendPaginatedResponse(res, attendance, page, limit, total);
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department');

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = asyncHandler(async (req, res) => {
  const { employeeId, location } = req.body;
  
  // Check if already checked in today
  const today = moment().startOf('day');
  const existingAttendance = await Attendance.findOne({
    employee: employeeId,
    date: { $gte: today.toDate() }
  });

  if (existingAttendance) {
    return res.status(400).json({
      success: false,
      message: 'Already checked in today'
    });
  }

  // Create attendance record
  const attendance = await Attendance.create({
    employee: employeeId,
    date: new Date(),
    checkIn: new Date(),
    location: {
      checkIn: location
    },
    status: 'Present'
  });

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = asyncHandler(async (req, res) => {
  const { employeeId, location } = req.body;
  
  // Find today's attendance
  const today = moment().startOf('day');
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: { $gte: today.toDate() },
    checkOut: null
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'No check-in record found for today'
    });
  }

  // Update attendance with check-out
  attendance.checkOut = new Date();
  if (location) {
    attendance.location.checkOut = location;
  }
  await attendance.save();

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Get employee attendance
// @route   GET /api/attendance/employee/:employeeId
// @access  Private
exports.getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;

  let query = { employee: employeeId };

  if (month && year) {
    const startDate = moment(`${year}-${month}-01`).startOf('month');
    const endDate = moment(`${year}-${month}-01`).endOf('month');
    query.date = { $gte: startDate.toDate(), $lte: endDate.toDate() };
  }

  const attendance = await Attendance.find(query).sort({ date: -1 });

  // Calculate statistics
  const stats = {
    totalDays: attendance.length,
    presentDays: attendance.filter(a => a.status === 'Present').length,
    absentDays: attendance.filter(a => a.status === 'Absent').length,
    lateDays: attendance.filter(a => a.status === 'Late').length,
    halfDays: attendance.filter(a => a.status === 'Half Day').length,
    totalWorkHours: attendance.reduce((sum, a) => sum + (a.workHours || 0), 0),
    totalOvertime: attendance.reduce((sum, a) => sum + (a.overtime || 0), 0)
  };

  res.status(200).json({
    success: true,
    data: {
      attendance,
      stats
    }
  });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (admin, hr)
exports.updateAttendance = asyncHandler(async (req, res) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (admin, hr)
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  await attendance.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

// @desc    Get attendance summary
// @route   GET /api/attendance/summary/stats
// @access  Private
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
  const today = moment().startOf('day');
  
  // Today's attendance
  const todayAttendance = await Attendance.countDocuments({
    date: { $gte: today.toDate() }
  });

  // Present today
  const presentToday = await Attendance.countDocuments({
    date: { $gte: today.toDate() },
    status: 'Present'
  });

  // Absent today (total employees - present)
  const totalEmployees = await Employee.countDocuments({ status: 'Active' });
  const absentToday = totalEmployees - todayAttendance;

  // Late today
  const lateToday = await Attendance.countDocuments({
    date: { $gte: today.toDate() },
    status: 'Late'
  });

  // On leave today
  const onLeaveToday = await Attendance.countDocuments({
    date: { $gte: today.toDate() },
    status: 'On Leave'
  });

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      todayAttendance,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday
    }
  });
});
