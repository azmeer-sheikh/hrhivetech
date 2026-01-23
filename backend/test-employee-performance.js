/**
 * Performance Test for Employee Creation
 * Tests the optimized employee creation endpoint
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Replace with a valid admin/HR token from your system
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'your-auth-token-here';

async function testEmployeeCreation() {
  console.log('🧪 Testing Employee Creation Performance\n');
  console.log('=' .repeat(60));

  const testEmployee = {
    firstName: 'Performance',
    lastName: 'Test',
    email: `perf.test.${Date.now()}@example.com`,
    phone: '+1-555-0100',
    employeeCode: `TEST${Date.now()}`,
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    position: 'Software Engineer',
    department: 'Engineering',
    salary: 75000,
    joiningDate: new Date().toISOString(),
    status: 'Active',
    createUserAccount: true,
    password: 'test123'
  };

  try {
    console.log('📊 Creating employee with user account...');
    const startTime = Date.now();

    const response = await axios.post(
      `${API_URL}/employees`,
      testEmployee,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseTime = Date.now() - startTime;

    console.log('\n✅ SUCCESS!');
    console.log('=' .repeat(60));
    console.log(`⚡ Response Time: ${responseTime}ms`);
    console.log(`📧 Email Status: ${response.data.message}`);
    console.log(`👤 Employee ID: ${response.data.data._id}`);
    console.log(`📝 Employee Code: ${response.data.data.employeeCode}`);
    console.log('\n💡 Performance Analysis:');
    
    if (responseTime < 500) {
      console.log('   🚀 EXCELLENT - Response time under 500ms');
    } else if (responseTime < 1000) {
      console.log('   ✓ GOOD - Response time under 1 second');
    } else if (responseTime < 2000) {
      console.log('   ⚠️ ACCEPTABLE - Response time under 2 seconds');
    } else {
      console.log('   ❌ SLOW - Response time over 2 seconds (needs optimization)');
    }

    console.log('\n📋 Expected Behavior:');
    console.log('   • Employee created instantly');
    console.log('   • User account created in background');
    console.log('   • Welcome email queued for delivery');
    console.log('   • No blocking operations in response');
    
    console.log('\n⏳ Background tasks running asynchronously...');
    console.log('   Check server logs for:');
    console.log('   - User account creation time');
    console.log('   - Email queue confirmation');
    console.log('=' .repeat(60));

    return response.data;
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Ensure backend is running');
    console.log('   2. Set TEST_AUTH_TOKEN in .env');
    console.log('   3. Verify API_URL is correct');
    console.log('   4. Check server logs for details');
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testEmployeeCreation()
    .then(() => {
      console.log('\n✓ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Test failed');
      process.exit(1);
    });
}

module.exports = { testEmployeeCreation };
