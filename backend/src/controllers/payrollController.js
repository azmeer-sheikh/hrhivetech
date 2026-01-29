const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');

const isSalesDepartment = (department) => {
  if (!department) return false;
  return department.toLowerCase().includes('sales');
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private
exports.getPayrolls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, month, year, status, department } = req.query;
  
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

  if (department) {
    const matchingEmployees = await Employee.find({
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    }).select('_id');

    const employeeIds = matchingEmployees.map(emp => emp._id.toString());

    if (employeeId) {
      query.employee = employeeIds.includes(employeeId.toString()) ? employeeId : { $in: [] };
    } else {
      query.employee = { $in: employeeIds };
    }
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

  const salesEmployee = isSalesDepartment(employee.department);
  const commission = toNumber(req.body.commission, 0);
  const bonus = toNumber(req.body.bonus, 0);

  if (!salesEmployee && (commission > 0 || bonus > 0)) {
    return res.status(400).json({
      success: false,
      message: 'Commission and bonus are only allowed for Sales employees'
    });
  }

  const allowances = {
    houseRent: toNumber(req.body?.allowances?.houseRent, 0),
    transport: toNumber(req.body?.allowances?.transport, 0),
    medical: toNumber(req.body?.allowances?.medical, 0),
    food: toNumber(req.body?.allowances?.food, 0),
    other: toNumber(req.body?.allowances?.other, 0)
  };

  const deductions = {
    tax: toNumber(req.body?.deductions?.tax, 0),
    providentFund: toNumber(req.body?.deductions?.providentFund, 0),
    insurance: toNumber(req.body?.deductions?.insurance, 0),
    loan: toNumber(req.body?.deductions?.loan, 0),
    other: toNumber(req.body?.deductions?.other, 0)
  };

  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);

  const overtimeHours = totalOvertimeHours;
  const overtimeRate = toNumber(req.body.overtimeRate, 0);
  const overtimeAmount = overtimeHours * overtimeRate;

  const baseSalary = toNumber(req.body.baseSalary, employee.salary ?? 0);
  const commissionValue = salesEmployee ? commission : 0;
  const bonusValue = salesEmployee ? bonus : 0;

  const netSalary = baseSalary + totalAllowances + overtimeAmount + commissionValue + bonusValue - totalDeductions;

  const payrollData = {
    ...req.body,
    employee: employeeId,
    baseSalary,
    commission: commissionValue,
    bonus: bonusValue,
    allowances,
    deductions,
    totalAllowances,
    totalDeductions,
    netSalary,
    workingDays: new Date(year, month, 0).getDate(),
    presentDays,
    absentDays: attendance.filter(a => a.status === 'Absent').length,
    leaveDays: attendance.filter(a => a.status === 'On Leave').length,
    overtime: {
      hours: overtimeHours,
      rate: overtimeRate,
      amount: overtimeAmount
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

  const employee = await Employee.findById(payroll.employee);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  const salesEmployee = isSalesDepartment(employee.department);
  const commission = req.body.commission !== undefined ? toNumber(req.body.commission, 0) : undefined;
  const bonus = req.body.bonus !== undefined ? toNumber(req.body.bonus, 0) : undefined;

  if (!salesEmployee && (commission > 0 || bonus > 0)) {
    return res.status(400).json({
      success: false,
      message: 'Commission and bonus are only allowed for Sales employees'
    });
  }

  if (!salesEmployee) {
    req.body.commission = 0;
    req.body.bonus = 0;
  }

  Object.assign(payroll, req.body);
  payroll = await payroll.save();

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
    totalBonus: payrolls.reduce((sum, p) => sum + (p.bonus || 0), 0),
    totalCommission: payrolls.reduce((sum, p) => sum + (p.commission || 0), 0),
    paid: payrolls.filter(p => p.status === 'Paid').length,
    pending: payrolls.filter(p => p.status !== 'Paid').length
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    Export payrolls to Excel
// @route   GET /api/payroll/export/excel
// @access  Private (admin, hr)
exports.exportPayrollExcel = asyncHandler(async (req, res) => {
  const { employeeId, month, year, status, department } = req.query;

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

  if (department) {
    const matchingEmployees = await Employee.find({
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    }).select('_id');

    const employeeIds = matchingEmployees.map(emp => emp._id.toString());

    if (employeeId) {
      query.employee = employeeIds.includes(employeeId.toString()) ? employeeId : { $in: [] };
    } else {
      query.employee = { $in: employeeIds };
    }
  }

  const payrolls = await Payroll.find(query)
    .populate('employee', 'firstName lastName employeeCode department position')
    .sort({ year: -1, month: -1 });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payroll Records');

  worksheet.columns = [
    { header: 'Employee Name', key: 'employeeName', width: 28 },
    { header: 'Employee Code', key: 'employeeCode', width: 18 },
    { header: 'Department', key: 'department', width: 24 },
    { header: 'Position', key: 'position', width: 22 },
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Year', key: 'year', width: 10 },
    { header: 'Base Salary (PKR)', key: 'baseSalary', width: 18 },
    { header: 'Commission (PKR)', key: 'commission', width: 18 },
    { header: 'Bonus (PKR)', key: 'bonus', width: 16 },
    { header: 'Allowances (PKR)', key: 'allowances', width: 18 },
    { header: 'Deductions (PKR)', key: 'deductions', width: 18 },
    { header: 'Overtime (PKR)', key: 'overtime', width: 18 },
    { header: 'Net Salary (PKR)', key: 'netSalary', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Payment Date', key: 'paymentDate', width: 16 }
  ];

  payrolls.forEach((payroll) => {
    const employee = payroll.employee || {};
    worksheet.addRow({
      employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      employeeCode: employee.employeeCode || '-',
      department: employee.department || '-',
      position: employee.position || '-',
      month: payroll.month,
      year: payroll.year,
      baseSalary: payroll.baseSalary || 0,
      commission: payroll.commission || 0,
      bonus: payroll.bonus || 0,
      allowances: payroll.totalAllowances || 0,
      deductions: payroll.totalDeductions || 0,
      overtime: payroll.overtime?.amount || 0,
      netSalary: payroll.netSalary || 0,
      status: payroll.status || 'Draft',
      paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toISOString().split('T')[0] : '-'
    });
  });

  const currencyColumns = ['G', 'H', 'I', 'J', 'K', 'L', 'M'];
  currencyColumns.forEach((col) => {
    worksheet.getColumn(col).numFmt = '₨#,##0.00';
  });

  worksheet.getRow(1).font = { bold: true };

  const fileName = `payroll-records-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Download payroll receipt (HTML)
// @route   GET /api/payroll/:id/receipt
// @access  Private (admin, hr)
exports.getPayrollReceipt = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department position');

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  const formatter = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  });

  const formatCurrency = (value) => formatter.format(value || 0);
  const monthName = new Date(payroll.year, payroll.month - 1, 1).toLocaleString('en-US', { month: 'long' });
  const employee = payroll.employee || {};

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Salary Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 700; }
          .section { margin-bottom: 16px; }
          .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
          th { background: #f9fafb; font-size: 12px; text-transform: uppercase; color: #6b7280; }
          .total { font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Salary Receipt</div>
            <div>${monthName} ${payroll.year}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <div>${payroll.status}</div>
          </div>
        </div>

        <div class="section">
          <div class="label">Employee</div>
          <div>${employee.firstName || ''} ${employee.lastName || ''}</div>
          <div>${employee.department || ''} ${employee.position ? `- ${employee.position}` : ''}</div>
          <div>Employee Code: ${employee.employeeCode || 'N/A'}</div>
        </div>

        <div class="section">
          <div class="label">Payroll Details</div>
          <table>
            <tr>
              <th>Base Salary</th>
              <td>${formatCurrency(payroll.baseSalary)}</td>
            </tr>
            <tr>
              <th>Commission</th>
              <td>${formatCurrency(payroll.commission)}</td>
            </tr>
            <tr>
              <th>Bonus</th>
              <td>${formatCurrency(payroll.bonus)}</td>
            </tr>
            <tr>
              <th>Total Allowances</th>
              <td>${formatCurrency(payroll.totalAllowances)}</td>
            </tr>
            <tr>
              <th>Total Deductions</th>
              <td>${formatCurrency(payroll.totalDeductions)}</td>
            </tr>
            <tr>
              <th>Overtime</th>
              <td>${formatCurrency(payroll.overtime?.amount || 0)}</td>
            </tr>
            <tr class="total">
              <th>Net Salary</th>
              <td>${formatCurrency(payroll.netSalary)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="label">Payment Date</div>
          <div>${payroll.paymentDate ? new Date(payroll.paymentDate).toISOString().split('T')[0] : 'Pending'}</div>
        </div>
      </body>
    </html>
  `;

  const fileName = `salary-receipt-${employee.employeeCode || payroll._id}-${payroll.year}-${payroll.month}.html`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.status(200).send(html);
});
