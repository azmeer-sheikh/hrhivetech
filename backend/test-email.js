require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

const testEmail = async () => {
  try {
    console.log('🚀 Starting email test...');
    console.log('📧 Email configuration:');
    console.log('   HOST:', process.env.EMAIL_HOST);
    console.log('   PORT:', process.env.EMAIL_PORT);
    console.log('   USER:', process.env.EMAIL_USER);
    console.log('   Has Google API Key:', !!process.env.GOOGLE_API_KEY);
    console.log('   Has Google Service Account:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

    const testOptions = {
      email: 'muhammad.hussain.cs8@gmail.com',
      subject: '🧪 HR Portal Test Email',
      message: `
Hello,

This is a test email from the HR Portal to verify email configuration is working correctly.

Test Details:
- Sent at: ${new Date().toISOString()}
- From: HR Portal System
- Configuration: Active

If you received this email, the announcement email functionality is working properly!

Best regards,
HR Portal Team
      `,
      html: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
      .content { padding: 20px; background-color: #f9f9f9; }
      .success { color: #27ae60; font-size: 18px; }
      .footer { padding: 15px; background-color: #ecf0f1; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🧪 HR Portal Test Email</h2>
      </div>
      <div class="content">
        <p class="success">✅ Email Configuration Test Successful!</p>
        <p>This is a test email from the HR Portal to verify email configuration is working correctly.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: white; border-left: 4px solid #27ae60;">
          <strong>Test Details:</strong>
          <ul>
            <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>From:</strong> HR Portal System</li>
            <li><strong>Status:</strong> Configuration Active</li>
          </ul>
        </div>

        <p><strong>What this means:</strong></p>
        <ul>
          <li>✅ Email server connection is working</li>
          <li>✅ SMTP credentials are valid</li>
          <li>✅ Announcement notifications will be sent to employees</li>
        </ul>

        <p style="margin-top: 20px; padding: 10px; background-color: #e8f5e9; border-left: 4px solid #27ae60;">
          <strong>Next Step:</strong> Create an announcement and it will automatically be sent to all eligible employees!
        </p>
      </div>
      <div class="footer">
        <p>This is an automated test message from HR Portal.</p>
        <p>&copy; ${new Date().getFullYear()} HR Department. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
      `,
    };

    console.log('\n📬 Sending test email...');
    const result = await sendEmail(testOptions);
    
    console.log('\n✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('\n📧 Check your inbox at: muhammad.hussain.cs8@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Email sending failed!');
    console.error('Error details:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify EMAIL_USER and EMAIL_PASSWORD in .env are correct');
    console.error('2. For Gmail, use an App Password (not your account password)');
    console.error('3. Ensure "Less secure app access" is enabled if not using App Password');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
};

testEmail();
