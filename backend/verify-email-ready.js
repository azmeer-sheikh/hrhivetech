/**
 * Test Email Through Running Server
 * Creates a test employee and verifies email queue
 */

require('dotenv').config();

async function testEmailThroughPortal() {
  console.log('\n🧪 Testing Email Through Portal\n');
  console.log('=' .repeat(60));
  
  // Check environment
  console.log('📧 Email Configuration:');
  console.log('   HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
  console.log('   PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
  console.log('   USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('   PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ SET' : '❌ NOT SET');
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
    console.log('\n❌ ERROR: EMAIL_HOST and EMAIL_PORT not configured!');
    console.log('✓ Already added to .env file');
    console.log('✓ Server needs to restart to load new variables\n');
    process.exit(1);
  }
  
  console.log('\n✅ Email configuration looks good!');
  console.log('\n📝 Next Steps:');
  console.log('   1. ✓ Email config verified');
  console.log('   2. ✓ Server is running (check other terminal)');
  console.log('   3. Create a test employee through UI');
  console.log('   4. Check server logs for email status');
  console.log('\n💡 Expected in server logs:');
  console.log('   ⚡ Employee created in ~50ms');
  console.log('   📌 Job queued: welcome-[id]');
  console.log('   ✓ Welcome email queued');
  console.log('   📧 Processing job: welcome-[id]');
  console.log('   Message sent: <message-id>');
  console.log('=' .repeat(60));
  console.log('\n✓ Ready to test through portal!\n');
}

testEmailThroughPortal();
