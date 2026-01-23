const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Performance = require('../models/Performance');
const { asyncHandler } = require('../utils/helpers');
const moment = require('moment');

// @desc    Get dashboard overview
// @route   GET /api/analytics/overview
// @access  Private
exports.getDashboardOverview = asyncHandler(async (req, res) => {
  // Employee statistics
  const totalEmployees = await Employee.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: 'Active' });
  const newEmployeesThisMonth = await Employee.countDocuments({
    joiningDate: { $gte: moment().startOf('month').toDate() }
  });

  // Attendance statistics for today
  const today = moment().startOf('day');
  const todayAttendance = await Attendance.countDocuments({
    date: { $gte: today.toDate() }
  });
  const presentToday = await Attendance.countDocuments({
    date: { $gte: today.toDate() },
    status: { $in: ['Present', 'Late'] }
  });

  // Leave statistics
  const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
  const approvedLeavesThisMonth = await Leave.countDocuments({
    status: 'Approved',
    startDate: { $gte: moment().startOf('month').toDate() }
  });

  // Payroll statistics for current month
  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();
  const payrollStats = await Payroll.aggregate([
    {
      $match: {
        month: currentMonth,
        year: currentYear
      }
    },
    {
      $group: {
        _id: null,
        totalPayroll: { $sum: '$netSalary' },
        totalProcessed: {
          $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
        },
        totalPending: {
          $sum: { $cond: [{ $ne: ['$status', 'Paid'] }, 1, 0] }
        }
      }
    }
  ]);

  // Department distribution
  const departmentStats = await Employee.aggregate([
    { $match: { status: 'Active' } },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newThisMonth: newEmployeesThisMonth
      },
      attendance: {
        totalToday: todayAttendance,
        presentToday,
        absentToday: activeEmployees - todayAttendance
      },
      leaves: {
        pending: pendingLeaves,
        approvedThisMonth: approvedLeavesThisMonth
      },
      payroll: payrollStats[0] || {
        totalPayroll: 0,
        totalProcessed: 0,
        totalPending: 0
      },
      departments: departmentStats
    }
  });
});

// @desc    Get attendance analytics
// @route   GET /api/analytics/attendance
// @access  Private
exports.getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;
  
  const start = startDate ? new Date(startDate) : moment().startOf('month').toDate();
  const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

  let employeeQuery = { status: 'Active' };
  if (department) {
    employeeQuery.department = department;
  }

  const employees = await Employee.find(employeeQuery);
  const employeeIds = employees.map(e => e._id);

  // Attendance by status
  const attendanceByStatus = await Attendance.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Daily attendance trend
  const dailyTrend = await Attendance.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        late: {
          $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Average work hours
  const avgWorkHours = await Attendance.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        date: { $gte: start, $lte: end },
        workHours: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        avgHours: { $avg: '$workHours' },
        totalOvertimeHours: { $sum: '$overtime' }
      }
    }
  ]);

  // Top performers by attendance
  const topPerformers = await Attendance.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$employee',
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        totalWorkHours: { $sum: '$workHours' }
      }
    },
    { $sort: { presentDays: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $project: {
        name: {
          $concat: ['$employee.firstName', ' ', '$employee.lastName']
        },
        department: '$employee.department',
        presentDays: 1,
        totalWorkHours: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      byStatus: attendanceByStatus,
      dailyTrend,
      averageWorkHours: avgWorkHours[0] || { avgHours: 0, totalOvertimeHours: 0 },
      topPerformers
    }
  });
});

// @desc    Get real-time labor cost (active employees)
// @route   GET /api/analytics/labor-cost/realtime
// @access  Private (admin, hr)
exports.getRealtimeLaborCost = asyncHandler(async (req, res) => {
  const { formula = 'standard' } = req.query;
  
  // Formula options: standard (160), extended (176), custom
  const hoursPerMonth = {
    standard: 160,  // 8 hours × 20 working days
    extended: 176,  // 8 hours × 22 working days
    custom: parseInt(req.query.customHours) || 184  // 8 hours × 23 working days
  };
  
  const selectedHours = hoursPerMonth[formula] || hoursPerMonth.standard;
  
  // Get today's date range
  const today = moment().startOf('day');
  const endOfDay = moment().endOf('day');
  
  // Get all active employees clocked in today (Present/Late with checkIn, no checkOut)
  const activeAttendance = await Attendance.find({
    date: { $gte: today.toDate(), $lte: endOfDay.toDate() },
    status: { $in: ['Present', 'Late'] },
    checkIn: { $exists: true, $ne: null },
    checkOut: null // Not checked out yet
  }).populate({
    path: 'employee',
    select: 'firstName lastName department position salary salaryType status'
  });
  
  // Filter out inactive employees and calculate costs
  const activeEmployees = activeAttendance
    .filter(record => record.employee && record.employee.status === 'Active')
    .map(record => {
      const employee = record.employee;
      
      // Calculate hourly rate based on salary type and formula
      let hourlyRate;
      if (employee.salaryType === 'Hourly') {
        hourlyRate = employee.salary;
      } else if (employee.salaryType === 'Annual') {
        hourlyRate = employee.salary / 12 / selectedHours; // Annual to hourly
      } else {
        hourlyRate = employee.salary / selectedHours; // Monthly to hourly (default)
      }
      
      // Calculate hours worked so far
      const checkInTime = moment(record.checkIn);
      const now = moment();
      const hoursWorked = now.diff(checkInTime, 'hours', true); // Decimal hours
      
      // Calculate cost so far
      const costSoFar = hoursWorked * hourlyRate;
      
      // Calculate projected cost (assuming 8-hour shift)
      const projectedCost = 8 * hourlyRate;
      
      return {
        employeeId: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.position,
        monthlySalary: employee.salary,
        salaryType: employee.salaryType,
        hourlyRate,
        checkInTime: record.checkIn,
        hoursWorked,
        costSoFar,
        projectedCost,
        remainingHours: Math.max(0, 8 - hoursWorked)
      };
    });
  
  // Calculate aggregated metrics
  const totalActiveEmployees = activeEmployees.length;
  const totalHourlyBurnRate = activeEmployees.reduce((sum, emp) => sum + emp.hourlyRate, 0);
  const burnRatePerSecond = totalHourlyBurnRate / 3600;
  const burnRatePerMinute = totalHourlyBurnRate / 60;
  const currentTotalCost = activeEmployees.reduce((sum, emp) => sum + emp.costSoFar, 0);
  const projectedDailyTotal = activeEmployees.reduce((sum, emp) => sum + emp.projectedCost, 0);
  
  // Department breakdown
  const departmentBreakdown = activeEmployees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        count: 0,
        totalHourlyRate: 0,
        currentCost: 0,
        projectedCost: 0
      };
    }
    acc[emp.department].count++;
    acc[emp.department].totalHourlyRate += emp.hourlyRate;
    acc[emp.department].currentCost += emp.costSoFar;
    acc[emp.department].projectedCost += emp.projectedCost;
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    timestamp: new Date(),
    formula: {
      type: formula,
      hoursPerMonth: selectedHours,
      description: formula === 'standard' ? '8 hours × 20 working days' : 
                   formula === 'extended' ? '8 hours × 22 working days' :
                   `Custom: ${selectedHours} hours/month`
    },
    data: {
      summary: {
        activeEmployees: totalActiveEmployees,
        burnRatePerHour: totalHourlyBurnRate,
        burnRatePerMinute: burnRatePerMinute,
        burnRatePerSecond: burnRatePerSecond,
        currentTotalCost: currentTotalCost,
        projectedDailyTotal: projectedDailyTotal
      },
      departmentBreakdown,
      activeEmployees: activeEmployees.sort((a, b) => b.costSoFar - a.costSoFar) // Sort by highest cost
    }
  });
});

// @desc    Get labor cost analytics (historical/monthly)
// @route   GET /api/analytics/labor-cost
// @access  Private (admin, hr)
exports.getLaborCostAnalytics = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const targetYear = year ? parseInt(year) : moment().year();
  const targetMonth = month ? parseInt(month) : moment().month() + 1;

  // Total payroll for the month
  const monthlyPayroll = await Payroll.aggregate([
    {
      $match: {
        year: targetYear,
        month: targetMonth
      }
    },
    {
      $group: {
        _id: null,
        totalBaseSalary: { $sum: '$baseSalary' },
        totalAllowances: { $sum: '$totalAllowances' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalOvertime: { $sum: '$overtime.amount' },
        totalBonus: { $sum: '$bonus' },
        totalNetSalary: { $sum: '$netSalary' }
      }
    }
  ]);

  // Department-wise cost
  const costByDepartment = await Payroll.aggregate([
    {
      $match: {
        year: targetYear,
        month: targetMonth
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $group: {
        _id: '$employee.department',
        totalCost: { $sum: '$netSalary' },
        employeeCount: { $sum: 1 },
        avgSalary: { $avg: '$netSalary' }
      }
    },
    { $sort: { totalCost: -1 } }
  ]);

  // Year-to-date cost
  const ytdCost = await Payroll.aggregate([
    {
      $match: {
        year: targetYear
      }
    },
    {
      $group: {
        _id: '$month',
        totalCost: { $sum: '$netSalary' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Highest paid employees
  const topEarners = await Payroll.aggregate([
    {
      $match: {
        year: targetYear,
        month: targetMonth
      }
    },
    { $sort: { netSalary: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $project: {
        name: {
          $concat: ['$employee.firstName', ' ', '$employee.lastName']
        },
        department: '$employee.department',
        position: '$employee.position',
        netSalary: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthly: monthlyPayroll[0] || {},
      byDepartment: costByDepartment,
      yearToDate: ytdCost,
      topEarners
    }
  });
});

// @desc    Get performance analytics
// @route   GET /api/analytics/performance
// @access  Private
exports.getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const { department, year } = req.query;
  
  let query = { status: { $in: ['Completed', 'Acknowledged'] } };
  
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query['reviewPeriod.endDate'] = { $gte: startDate, $lte: endDate };
  }

  let reviews = await Performance.find(query).populate('employee', 'department');

  if (department) {
    reviews = reviews.filter(r => r.employee.department === department);
  }

  // Average ratings
  const avgRatings = {
    workQuality: 0,
    productivity: 0,
    communication: 0,
    teamwork: 0,
    punctuality: 0,
    initiative: 0,
    leadership: 0,
    problemSolving: 0,
    overall: 0
  };

  if (reviews.length > 0) {
    reviews.forEach(review => {
      Object.keys(avgRatings).forEach(key => {
        if (key === 'overall') {
          avgRatings[key] += review.overallRating || 0;
        } else if (review.ratings[key]) {
          avgRatings[key] += review.ratings[key];
        }
      });
    });

    Object.keys(avgRatings).forEach(key => {
      avgRatings[key] = (avgRatings[key] / reviews.length).toFixed(2);
    });
  }

  // Performance distribution
  const distribution = {
    excellent: reviews.filter(r => r.overallRating >= 4.5).length,
    good: reviews.filter(r => r.overallRating >= 3.5 && r.overallRating < 4.5).length,
    average: reviews.filter(r => r.overallRating >= 2.5 && r.overallRating < 3.5).length,
    belowAverage: reviews.filter(r => r.overallRating < 2.5).length
  };

  res.status(200).json({
    success: true,
    data: {
      totalReviews: reviews.length,
      averageRatings: avgRatings,
      distribution
    }
  });
});

// @desc    Get leave analytics
// @route   GET /api/analytics/leaves
// @access  Private
exports.getLeaveAnalytics = asyncHandler(async (req, res) => {
  const { year, department } = req.query;
  const targetYear = year ? parseInt(year) : moment().year();

  let employeeQuery = { status: 'Active' };
  if (department) {
    employeeQuery.department = department;
  }

  const employees = await Employee.find(employeeQuery);
  const employeeIds = employees.map(e => e._id);

  // Leave statistics by type
  const leaveByType = await Leave.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        startDate: { $gte: new Date(`${targetYear}-01-01`) },
        status: 'Approved'
      }
    },
    {
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 },
        totalDays: { $sum: '$numberOfDays' }
      }
    }
  ]);

  // Monthly leave trend
  const monthlyTrend = await Leave.aggregate([
    {
      $match: {
        employee: { $in: employeeIds },
        startDate: { $gte: new Date(`${targetYear}-01-01`) },
        status: 'Approved'
      }
    },
    {
      $group: {
        _id: { $month: '$startDate' },
        count: { $sum: 1 },
        totalDays: { $sum: '$numberOfDays' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Pending leaves
  const pendingLeaves = await Leave.countDocuments({
    employee: { $in: employeeIds },
    status: 'Pending'
  });

  res.status(200).json({
    success: true,
    data: {
      byType: leaveByType,
      monthlyTrend,
      pendingLeaves
    }
  });
});
