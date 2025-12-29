const Leave = require('../models/Leave');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, status, leaveType } = req.query;
  
  let query = {};
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (leaveType) {
    query.leaveType = leaveType;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const leaves = await Leave.find(query)
    .populate('employee', 'firstName lastName employeeCode department')
    .populate('approvedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Leave.countDocuments(query);
  
  sendPaginatedResponse(res, leaves, page, limit, total);
});

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department')
    .populate('approvedBy', 'username email');

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.create(req.body);

  res.status(201).json({
    success: true,
    data: leave
  });
});

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private
exports.updateLeave = asyncHandler(async (req, res) => {
  let leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  // Check if leave can be updated
  if (leave.status === 'Approved') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update approved leave'
    });
  }

  leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
exports.deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  if (leave.status === 'Approved') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete approved leave'
    });
  }

  await leave.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Leave request deleted successfully'
  });
});

// @desc    Approve leave
// @route   PATCH /api/leaves/:id/approve
// @access  Private (admin, hr, manager)
exports.approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: 'Leave request is already processed'
    });
  }

  leave.status = 'Approved';
  leave.approvedBy = req.user.id;
  leave.approvedDate = Date.now();
  
  await leave.save();

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc    Reject leave
// @route   PATCH /api/leaves/:id/reject
// @access  Private (admin, hr, manager)
exports.rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: 'Leave request is already processed'
    });
  }

  leave.status = 'Rejected';
  leave.approvedBy = req.user.id;
  leave.approvedDate = Date.now();
  leave.rejectionReason = req.body.reason || 'Not specified';
  
  await leave.save();

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc    Get employee leave balance
// @route   GET /api/leaves/balance/:employeeId
// @access  Private
exports.getLeaveBalance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const currentYear = new Date().getFullYear();

  // Get all approved leaves for current year
  const leaves = await Leave.find({
    employee: employeeId,
    status: 'Approved',
    startDate: { $gte: new Date(`${currentYear}-01-01`) }
  });

  // Calculate leave balance by type
  const leaveBalance = {
    'Sick Leave': { total: 10, used: 0, remaining: 10 },
    'Casual Leave': { total: 12, used: 0, remaining: 12 },
    'Annual Leave': { total: 20, used: 0, remaining: 20 },
    'Maternity Leave': { total: 90, used: 0, remaining: 90 },
    'Paternity Leave': { total: 15, used: 0, remaining: 15 }
  };

  leaves.forEach(leave => {
    if (leaveBalance[leave.leaveType]) {
      leaveBalance[leave.leaveType].used += leave.numberOfDays;
      leaveBalance[leave.leaveType].remaining = 
        leaveBalance[leave.leaveType].total - leaveBalance[leave.leaveType].used;
    }
  });

  res.status(200).json({
    success: true,
    data: leaveBalance
  });
});
