/**
 * Quick SMTP Connection Test
 * Tests if SMTP server is reachable
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPConnection() {
  console.log('🔌 Testing SMTP Connection...\n');
  console.log('Configuration:');
  console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Password: ${process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true, // Enable debug output
  });

  try {
    console.log('⏳ Verifying connection...');
    await transporter.verify();
    console.log('\n✅ SMTP Connection Successful!');
    console.log('✓ Server is reachable');
    console.log('✓ Authentication works');
    console.log('✓ Ready to send emails\n');
    return true;
  } catch (error) {
    console.error('\n❌ SMTP Connection Failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    
    if (error.message.includes('timeout')) {
      console.error('   • Connection timeout - possible firewall/network issue');
      console.error('   • Try port 465 (SSL) instead of 587 (TLS)');
      console.error('   • Check if SMTP is blocked by your ISP/firewall');
    }
    
    if (error.message.includes('authentication') || error.message.includes('Invalid login')) {
      console.error('   • Check EMAIL_USER and EMAIL_PASSWORD');
      console.error('   • For Gmail, use App Password (not regular password)');
      console.error('   • Enable 2-Step Verification first');
    }
    
    console.error('\n📝 Gmail Setup:');
    console.error('   1. Go to: https://myaccount.google.com/apppasswords');
    console.error('   2. Create App Password for "Mail"');
    console.error('   3. Use that 16-character password in .env\n');
    
    return false;
  }
}

testSMTPConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
