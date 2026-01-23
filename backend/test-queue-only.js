/**
 * Quick Email Queue Test
 * Tests the optimized email queue with real SMTP
 */

require('dotenv').config();
const { addEmailJob } = require('./src/utils/emailJobQueue');
const generateWelcomeEmail = require('./src/utils/emailTemplates/welcomeTemplate');

console.log('📧 Testing Email Queue System\n');

const testEmployee = {
  firstName: 'Test',
  lastName: 'Employee',
  email: 'mh99669517@gmail.com',
  employeeCode: 'TEST-001',
  department: 'Engineering',
  position: 'Developer',
  status: 'Active'
};

console.log('Creating welcome email for:', testEmployee.email);

const welcomeEmailHtml = generateWelcomeEmail(testEmployee);
const emailOptions = {
  email: testEmployee.email,
  subject: `Welcome to ${process.env.FROM_NAME || 'Our Company'}!`,
  html: welcomeEmailHtml,
  message: `Welcome ${testEmployee.firstName} ${testEmployee.lastName}!`
};

const jobId = addEmailJob(emailOptions, 0, `test-${Date.now()}`);

console.log('✓ Email queued successfully!');
console.log('✓ Job ID:', jobId);
console.log('\n⏳ Email will be processed by queue processor...');
console.log('💡 Check server logs for email delivery status');
console.log('📬 Email should arrive within 5-10 seconds\n');

// Keep process alive for a bit to let queue process
setTimeout(() => {
  console.log('✓ Test complete - check your email!');
  process.exit(0);
}, 15000);
