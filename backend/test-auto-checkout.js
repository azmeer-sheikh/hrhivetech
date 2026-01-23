require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./src/models/Attendance');
const moment = require('moment');

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Test the auto-checkout logic
async function testAutoCheckout() {
  try {
    console.log('\n🧪 Testing Auto-Checkout Logic\n');
    console.log('=' .repeat(50));
    
    // Get yesterday's date range (simulating 4 AM next day)
    const yesterday = moment().subtract(1, 'day');
    const startOfDay = yesterday.startOf('day').toDate();
    const endOfDay = yesterday.endOf('day').toDate();
    
    console.log(`\n📅 Checking for attendance records from ${yesterday.format('YYYY-MM-DD')}`);
    
    // Find all attendance records from yesterday that haven't checked out
    const attendanceRecords = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      checkIn: { $ne: null },
      checkOut: null
    }).populate('employee', 'firstName lastName employeeCode');
    
    if (attendanceRecords.length === 0) {
      console.log('\n✅ No employees found who need auto-checkout');
      
      // Check today's records instead
      const today = moment();
      const startOfToday = today.startOf('day').toDate();
      const endOfToday = today.endOf('day').toDate();
      
      console.log(`\n📅 Checking today's attendance (${today.format('YYYY-MM-DD')})...`);
      const todayRecords = await Attendance.find({
        date: { $gte: startOfToday, $lte: endOfToday },
        checkIn: { $ne: null },
        checkOut: null
      }).populate('employee', 'firstName lastName employeeCode');
      
      if (todayRecords.length > 0) {
        console.log(`\n📋 Found ${todayRecords.length} employee(s) checked in today (not checked out yet):`);
        todayRecords.forEach((record, index) => {
          const employeeName = record.employee 
            ? `${record.employee.firstName} ${record.employee.lastName}` 
            : 'Unknown';
          const checkInTime = moment(record.checkIn).format('HH:mm:ss');
          console.log(`   ${index + 1}. ${employeeName} (${record.employee?.employeeCode || 'N/A'}) - Checked in at ${checkInTime}`);
        });
        console.log('\n💡 These will be auto-checked out tomorrow at 4:00 AM');
      } else {
        console.log('   No one is checked in today either');
      }
      
      mongoose.connection.close();
      return;
    }
    
    console.log(`\n📋 Found ${attendanceRecords.length} employee(s) to auto-checkout:\n`);
    
    // Display records before checkout
    attendanceRecords.forEach((record, index) => {
      const employeeName = record.employee 
        ? `${record.employee.firstName} ${record.employee.lastName}` 
        : 'Unknown';
      const checkInTime = moment(record.checkIn).format('HH:mm:ss');
      console.log(`   ${index + 1}. ${employeeName} (${record.employee?.employeeCode || 'N/A'})`);
      console.log(`      - Checked in: ${checkInTime}`);
      console.log(`      - Currently not checked out`);
    });
    
    console.log('\n⏳ Performing auto-checkout...\n');
    
    // Auto checkout each employee
    const checkoutTime = new Date();
    const updatePromises = attendanceRecords.map(async (record) => {
      const originalCheckIn = record.checkIn;
      record.checkOut = checkoutTime;
      
      // Calculate work hours
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
      
      console.log(`   ✓ ${employeeName}`);
      console.log(`      - Work hours: ${record.workHours} hrs`);
      if (record.overtime > 0) {
        console.log(`      - Overtime: ${record.overtime} hrs`);
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`\n✅ Auto-checkout test completed successfully for ${attendanceRecords.length} employee(s)`);
    console.log('\n' + '='.repeat(50));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('\n❌ Error in auto-checkout test:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the test
testAutoCheckout();
