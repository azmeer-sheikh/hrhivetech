/**
 * Test Real-Time Labor Cost API
 * 
 * This script tests the new /api/analytics/labor-cost/realtime endpoint
 * Run: node backend/test-labor-cost-api.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');

// Models
const Employee = require('./src/models/Employee');
const Attendance = require('./src/models/Attendance');

async function testRealtimeLaborCost() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test different formulas
    const formulas = ['standard', 'extended', 'custom'];
    
    for (const formula of formulas) {
      console.log(`\n📊 Testing ${formula.toUpperCase()} formula:`);
      console.log('='.repeat(50));
      
      const hoursPerMonth = formula === 'standard' ? 160 : 
                           formula === 'extended' ? 176 : 184;
      
      // Get today's date
      const today = moment().startOf('day');
      const endOfDay = moment().endOf('day');
      
      // Get active attendance
      const activeAttendance = await Attendance.find({
        date: { $gte: today.toDate(), $lte: endOfDay.toDate() },
        status: { $in: ['Present', 'Late'] },
        checkIn: { $exists: true, $ne: null },
        checkOut: null
      }).populate({
        path: 'employee',
        select: 'firstName lastName department position salary salaryType status'
      });
      
      console.log(`\n📋 Active Employees: ${activeAttendance.length}`);
      
      if (activeAttendance.length === 0) {
        console.log('⚠️  No active employees found (no one clocked in)');
        console.log('💡 Tip: Have an employee check in to see real-time costs');
        continue;
      }
      
      // Calculate costs
      let totalBurnRate = 0;
      let totalCurrentCost = 0;
      let totalProjectedCost = 0;
      
      console.log('\n👥 Employee Breakdown:');
      console.log('-'.repeat(100));
      console.log(
        'Name'.padEnd(25) +
        'Department'.padEnd(15) +
        'Hourly Rate'.padEnd(15) +
        'Hours Worked'.padEnd(15) +
        'Cost So Far'.padEnd(15) +
        'Projected'
      );
      console.log('-'.repeat(100));
      
      activeAttendance.forEach(record => {
        const emp = record.employee;
        if (!emp || emp.status !== 'Active') return;
        
        // Calculate hourly rate
        let hourlyRate;
        if (emp.salaryType === 'Hourly') {
          hourlyRate = emp.salary;
        } else if (emp.salaryType === 'Annual') {
          hourlyRate = emp.salary / 12 / hoursPerMonth;
        } else {
          hourlyRate = emp.salary / hoursPerMonth;
        }
        
        // Calculate hours worked
        const checkInTime = moment(record.checkIn);
        const now = moment();
        const hoursWorked = now.diff(checkInTime, 'hours', true);
        
        // Calculate costs
        const costSoFar = hoursWorked * hourlyRate;
        const projectedCost = 8 * hourlyRate;
        
        totalBurnRate += hourlyRate;
        totalCurrentCost += costSoFar;
        totalProjectedCost += projectedCost;
        
        console.log(
          `${emp.firstName} ${emp.lastName}`.padEnd(25) +
          emp.department.padEnd(15) +
          `PKR ${hourlyRate.toFixed(2)}`.padEnd(15) +
          `${hoursWorked.toFixed(2)}h`.padEnd(15) +
          `PKR ${costSoFar.toFixed(2)}`.padEnd(15) +
          `PKR ${projectedCost.toFixed(2)}`
        );
      });
      
      console.log('-'.repeat(100));
      console.log(`${'TOTALS'.padEnd(25)}${''.padEnd(30)}${''.padEnd(15)}PKR ${totalCurrentCost.toFixed(2)}`.padEnd(15) + `PKR ${totalProjectedCost.toFixed(2)}`);
      console.log('='.repeat(100));
      
      // Display summary
      console.log('\n💰 Summary:');
      console.log(`   Burn Rate (per hour):   PKR ${totalBurnRate.toFixed(2)}`);
      console.log(`   Burn Rate (per minute): PKR ${(totalBurnRate / 60).toFixed(2)}`);
      console.log(`   Burn Rate (per second): PKR ${(totalBurnRate / 3600).toFixed(4)}`);
      console.log(`   Current Total Cost:     PKR ${totalCurrentCost.toFixed(2)}`);
      console.log(`   Projected Daily Total:  PKR ${totalProjectedCost.toFixed(2)}`);
      
      // Calculate estimated remaining cost
      const remainingCost = totalProjectedCost - totalCurrentCost;
      console.log(`   Estimated Remaining:    PKR ${remainingCost.toFixed(2)}`);
      
      // Department breakdown
      const deptBreakdown = {};
      activeAttendance.forEach(record => {
        const emp = record.employee;
        if (!emp || emp.status !== 'Active') return;
        
        const dept = emp.department;
        if (!deptBreakdown[dept]) {
          deptBreakdown[dept] = {
            count: 0,
            totalCost: 0
          };
        }
        
        let hourlyRate;
        if (emp.salaryType === 'Hourly') {
          hourlyRate = emp.salary;
        } else if (emp.salaryType === 'Annual') {
          hourlyRate = emp.salary / 12 / hoursPerMonth;
        } else {
          hourlyRate = emp.salary / hoursPerMonth;
        }
        
        const checkInTime = moment(record.checkIn);
        const now = moment();
        const hoursWorked = now.diff(checkInTime, 'hours', true);
        const costSoFar = hoursWorked * hourlyRate;
        
        deptBreakdown[dept].count++;
        deptBreakdown[dept].totalCost += costSoFar;
      });
      
      console.log('\n🏢 Department Breakdown:');
      console.log('-'.repeat(60));
      console.log('Department'.padEnd(30) + 'Employees'.padEnd(15) + 'Current Cost');
      console.log('-'.repeat(60));
      Object.entries(deptBreakdown)
        .sort((a, b) => b[1].totalCost - a[1].totalCost)
        .forEach(([dept, data]) => {
          console.log(
            dept.padEnd(30) +
            String(data.count).padEnd(15) +
            `PKR ${data.totalCost.toFixed(2)}`
          );
        });
      console.log('-'.repeat(60));
    }
    
    console.log('\n\n✅ Test completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   1. This shows what the API will return in real-time');
    console.log('   2. Costs update every second in the frontend');
    console.log('   3. Try different formulas: standard, extended, or custom');
    console.log('   4. Make sure employees are "clocked in" to see data\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the test
testRealtimeLaborCost();
