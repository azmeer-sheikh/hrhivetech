const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const moment = require('moment');

// Auto checkout all employees who haven't checked out at 4:00 AM
const autoCheckoutJob = cron.schedule('0 4 * * *', async () => {
  try {
    console.log('🕐 Running auto-checkout job at 4:00 AM...');
    
    // Get yesterday's date range (since we're running at 4 AM, we checkout previous day)
    const yesterday = moment().subtract(1, 'day');
    const startOfDay = yesterday.startOf('day').toDate();
    const endOfDay = yesterday.endOf('day').toDate();
    
    // Find all attendance records from yesterday that haven't checked out
    const attendanceRecords = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      checkIn: { $ne: null },
      checkOut: null
    }).populate('employee', 'firstName lastName employeeCode');
    
    if (attendanceRecords.length === 0) {
      console.log('✅ No employees to auto-checkout');
      return;
    }
    
    console.log(`📋 Found ${attendanceRecords.length} employees to auto-checkout`);
    
    // Auto checkout each employee at 4:00 AM
    const checkoutTime = new Date(); // Current time (4:00 AM)
    const updatePromises = attendanceRecords.map(async (record) => {
      record.checkOut = checkoutTime;
      
      // Calculate work hours if checkIn exists
      if (record.checkIn) {
        const workMilliseconds = checkoutTime - record.checkIn;
        record.workHours = parseFloat((workMilliseconds / (1000 * 60 * 60)).toFixed(2));
        
        // Calculate overtime (assuming 8 hours is standard)
        const standardHours = 8;
        if (record.workHours > standardHours) {
          record.overtime = parseFloat((record.workHours - standardHours).toFixed(2));
        }
      }
      
      await record.save();
      
      const employeeName = record.employee 
        ? `${record.employee.firstName} ${record.employee.lastName}` 
        : 'Unknown';
      
      console.log(`   ✓ Auto-checked out: ${employeeName} (${record.employee?.employeeCode || 'N/A'})`);
    });
    
    await Promise.all(updatePromises);
    
    console.log(`✅ Auto-checkout completed successfully for ${attendanceRecords.length} employee(s)`);
  } catch (error) {
    console.error('❌ Error in auto-checkout job:', error);
  }
}, {
  scheduled: false,
  timezone: "America/New_York" // Change this to your timezone
});

// Start all scheduled jobs
const startScheduledJobs = () => {
  console.log('📅 Starting scheduled jobs...');
  autoCheckoutJob.start();
  console.log('✅ Auto-checkout job scheduled for 4:00 AM daily');
};

// Stop all scheduled jobs
const stopScheduledJobs = () => {
  console.log('🛑 Stopping scheduled jobs...');
  autoCheckoutJob.stop();
};

module.exports = {
  startScheduledJobs,
  stopScheduledJobs,
  autoCheckoutJob
};
