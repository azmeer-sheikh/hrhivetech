const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const ExcelJS = require('exceljs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
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

exports.getPayrollReceipt = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department position email phone bankAccount');

  if (!payroll) {
    return res.status(404).json({
      success: false,
      message: 'Payroll record not found'
    });
  }

  const formatter = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const formatCurrency = (value) => formatter.format(value || 0).replace('PKR', '').trim();
  const monthName = new Date(payroll.year, payroll.month - 1, 1).toLocaleString('en-US', { month: 'long' });
  const employee = payroll.employee || {};
  const receiptDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Calculate gross earnings
  const grossEarnings = payroll.baseSalary + (payroll.commission || 0) + (payroll.bonus || 0) + 
                        (payroll.totalAllowances || 0) + (payroll.overtime?.amount || 0);

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Define colors
    const yellow = rgb(0.984, 0.749, 0.141); // #fbbf24
    const black = rgb(0.102, 0.102, 0.102); // #1a1a1a
    const gray = rgb(0.4, 0.4, 0.4); // #666666
    const lightGray = rgb(0.898, 0.898, 0.898); // #e5e5e5
    const yellowLight = rgb(0.996, 0.953, 0.78); // #fef3c7
    const yellowDark = rgb(0.573, 0.251, 0.055); // #92400e
    
    const margin = 50;
    let yPosition = height - 70;
    
    // Header - Yellow line
    page.drawRectangle({
      x: margin,
      y: yPosition + 20,
      width: width - (margin * 2),
      height: 3,
      color: yellow,
    });
    
    // Company Logo - HIVETECH
    page.drawText('HIVE', {
      x: (width - 220) / 2,
      y: yPosition,
      size: 28,
      font: boldFont,
      color: black,
    });
    page.drawText('TECH', {
      x: (width - 220) / 2 + 90,
      y: yPosition,
      size: 28,
      font: boldFont,
      color: yellow,
    });
    
    yPosition -= 20;
    page.drawText('SOLUTION', {
      x: (width - 80) / 2,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: gray,
    });
    
    yPosition -= 30;
    page.drawText(receiptDate, {
      x: width - margin - 200,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: gray,
    });
    
    // Title
    yPosition -= 40;
    page.drawText('SALARY SLIP', {
      x: (width - 180) / 2,
      y: yPosition,
      size: 22,
      font: boldFont,
      color: black,
    });
    
    // Yellow underline
    yPosition -= 15;
    page.drawRectangle({
      x: (width - 150) / 2,
      y: yPosition,
      width: 150,
      height: 3,
      color: yellow,
    });
    
    // Separator line
    yPosition -= 30;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: lightGray,
    });
    
    // Employee Information
    yPosition -= 30;
    const infoFontSize = 10;
    
    page.drawText('Employee Name:', { x: margin, y: yPosition, size: infoFontSize, font: regularFont, color: gray });
    page.drawText(`${employee.firstName || ''} ${employee.lastName || ''}`, { x: margin + 130, y: yPosition, size: infoFontSize, font: boldFont, color: black });
    
    page.drawText('Month:', { x: width - margin - 250, y: yPosition, size: infoFontSize, font: regularFont, color: gray });
    page.drawText(`${monthName} ${payroll.year}`, { x: width - margin - 120, y: yPosition, size: infoFontSize, font: boldFont, color: black });
    
    yPosition -= 20;
    page.drawText('Designation:', { x: margin, y: yPosition, size: infoFontSize, font: regularFont, color: gray });
    page.drawText(employee.position || 'N/A', { x: margin + 130, y: yPosition, size: infoFontSize, font: boldFont, color: black });
    
    page.drawText('Employee Code:', { x: width - margin - 250, y: yPosition, size: infoFontSize, font: regularFont, color: gray });
    page.drawText(employee.employeeCode || 'N/A', { x: width - margin - 120, y: yPosition, size: infoFontSize, font: boldFont, color: black });
    
    yPosition -= 20;
    page.drawText('Department:', { x: margin, y: yPosition, size: infoFontSize, font: regularFont, color: gray });
    page.drawText(employee.department || 'N/A', { x: margin + 130, y: yPosition, size: infoFontSize, font: boldFont, color: black });
    
    // Separator line
    yPosition -= 30;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: lightGray,
    });
    
    // Earnings and Deductions sections
    yPosition -= 30;
    const columnWidth = (width - margin * 2 - 40) / 2;
    
    // Earnings Title
    page.drawText('Earnings', { x: margin, y: yPosition, size: 13, font: boldFont, color: black });
    page.drawRectangle({ x: margin, y: yPosition - 8, width: 120, height: 2, color: yellow });
    
    // Deductions Title
    page.drawText('Deductions', { x: margin + columnWidth + 40, y: yPosition, size: 13, font: boldFont, color: black });
    page.drawRectangle({ x: margin + columnWidth + 40, y: yPosition - 8, width: 120, height: 2, color: yellow });
    
    yPosition -= 30;
    let earningsY = yPosition;
    let deductionsY = yPosition;
    const rowFontSize = 10;
    const rowSpacing = 18;
    
    // Add earnings
    page.drawText('Basic Salary', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
    page.drawText(`PKR ${formatCurrency(payroll.baseSalary)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
    earningsY -= rowSpacing;
    
    if (payroll.allowances?.houseRent) {
      page.drawText('House Rent Allowance', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.allowances.houseRent)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    if (payroll.allowances?.transport) {
      page.drawText('Transport Allowance', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.allowances.transport)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    if (payroll.allowances?.medical) {
      page.drawText('Medical Allowance', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.allowances.medical)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    if ((payroll.allowances?.other || 0) + (payroll.overtime?.amount || 0) > 0) {
      page.drawText('Utility Allowance', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency((payroll.allowances?.other || 0) + (payroll.overtime?.amount || 0))}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    if (payroll.commission) {
      page.drawText('Commission', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.commission)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    if (payroll.bonus) {
      page.drawText('Bonus', { x: margin, y: earningsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.bonus)}`, { x: margin + columnWidth - 100, y: earningsY, size: rowFontSize, font: boldFont, color: black });
      earningsY -= rowSpacing;
    }
    
    // Add deductions
    if (payroll.deductions?.providentFund) {
      page.drawText('Provident Fund', { x: margin + columnWidth + 40, y: deductionsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.deductions.providentFund)}`, { x: width - margin - 100, y: deductionsY, size: rowFontSize, font: boldFont, color: black });
      deductionsY -= rowSpacing;
    }
    
    if (payroll.deductions?.tax) {
      page.drawText('Tax', { x: margin + columnWidth + 40, y: deductionsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.deductions.tax)}`, { x: width - margin - 100, y: deductionsY, size: rowFontSize, font: boldFont, color: black });
      deductionsY -= rowSpacing;
    }
    
    if (payroll.deductions?.insurance) {
      page.drawText('Insurance', { x: margin + columnWidth + 40, y: deductionsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.deductions.insurance)}`, { x: width - margin - 100, y: deductionsY, size: rowFontSize, font: boldFont, color: black });
      deductionsY -= rowSpacing;
    }
    
    if (payroll.deductions?.loan) {
      page.drawText('Loan Deduction', { x: margin + columnWidth + 40, y: deductionsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.deductions.loan)}`, { x: width - margin - 100, y: deductionsY, size: rowFontSize, font: boldFont, color: black });
      deductionsY -= rowSpacing;
    }
    
    if (payroll.deductions?.other) {
      page.drawText('Other Deductions', { x: margin + columnWidth + 40, y: deductionsY, size: rowFontSize, font: regularFont, color: black });
      page.drawText(`PKR ${formatCurrency(payroll.deductions.other)}`, { x: width - margin - 100, y: deductionsY, size: rowFontSize, font: boldFont, color: black });
      deductionsY -= rowSpacing;
    }
    
    // Gross Earnings box
    earningsY -= 10;
    page.drawRectangle({
      x: margin,
      y: earningsY - 5,
      width: columnWidth,
      height: 25,
      color: yellowLight,
    });
    
    page.drawText('Gross Earnings', { x: margin + 5, y: earningsY + 3, size: rowFontSize, font: boldFont, color: yellowDark });
    page.drawText(`PKR ${formatCurrency(grossEarnings)}`, { x: margin + columnWidth - 105, y: earningsY + 3, size: rowFontSize, font: boldFont, color: yellowDark });
    
    // Move below both sections
    yPosition = Math.min(earningsY, deductionsY) - 40;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: lightGray,
    });
    
    // Net Salary Section
    yPosition -= 30;
    page.drawRectangle({
      x: margin,
      y: yPosition - 35,
      width: width - margin * 2,
      height: 65,
      color: rgb(0.98, 0.98, 0.98),
    });
    
    page.drawText('Net Payable Salary', { x: margin + 10, y: yPosition, size: 14, font: boldFont, color: black });
    yPosition -= 20;
    page.drawText('In Words: Pakistan Rupees Only', { x: margin + 10, y: yPosition, size: 10, font: regularFont, color: gray });
    yPosition -= 18;
    page.drawText(`PKR ${formatCurrency(payroll.netSalary)}`, { x: margin + 10, y: yPosition, size: 12, font: boldFont, color: black });
    
    // Footer
    yPosition -= 50;
    page.drawRectangle({
      x: margin,
      y: yPosition,
      width: width - margin * 2,
      height: 2,
      color: yellow,
    });
    
    yPosition -= 20;
    const footerText = 'HiveTech Solution | Email: info@hivetechsol.com | Phone: +92-XXX-XXXXXXX';
    const footerWidth = regularFont.widthOfTextAtSize(footerText, 9);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: gray,
    });
    
    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    
    // Set response headers
    const employeeName = `${employee.firstName || ''}_${employee.lastName || ''}`.trim().replace(/\s+/g, '_');
    const fileName = `Salary_Receipt_${employeeName}_${monthName}_${payroll.year}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF receipt'
    });
  }
});
