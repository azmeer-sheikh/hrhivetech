require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');
const generateWelcomeEmail = require('./src/utils/emailTemplates/welcomeTemplate');

const testWelcomeEmail = async () => {
  try {
    console.log('🚀 Starting welcome email test...');
    console.log('📧 Email configuration:');
    console.log('   HOST:', process.env.EMAIL_HOST);
    console.log('   PORT:', process.env.EMAIL_PORT);
    console.log('   USER:', process.env.EMAIL_USER);
    console.log('   FROM_NAME:', process.env.FROM_NAME || 'HR Portal');
    console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || process.env.EMAIL_USER);

    // Create a test employee object
    const testEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'muhammad.hussain.cs8@gmail.com', // Change this to your test email
      employeeCode: 'EMP-2026-001',
      department: 'Engineering',
      position: 'Senior Software Developer',
      dateOfJoining: new Date('2026-02-01'),
      status: 'Active'
    };

    console.log('\n📝 Test Employee Details:');
    console.log('   Name:', `${testEmployee.firstName} ${testEmployee.lastName}`);
    console.log('   Email:', testEmployee.email);
    console.log('   Position:', testEmployee.position);
    console.log('   Department:', testEmployee.department);
    console.log('   Start Date:', testEmployee.dateOfJoining.toLocaleDateString());

    console.log('\n📤 Generating and sending welcome email...');

    // Generate the welcome email HTML
    const welcomeEmailHtml = generateWelcomeEmail(testEmployee);

    // Send the email
    await sendEmail({
      email: testEmployee.email,
      subject: `Welcome to ${process.env.FROM_NAME || 'Our Company'}!`,
      html: welcomeEmailHtml,
      message: `Welcome ${testEmployee.firstName} ${testEmployee.lastName}! We're excited to have you join our team.`
    });

    console.log('\n✅ Welcome email sent successfully!');
    console.log('📬 Please check', testEmployee.email, 'for the welcome email.');
    console.log('\n💡 Tips:');
    console.log('   - Check spam/junk folder if not in inbox');
    console.log('   - The email has a modern HTML design with your employee information');
    console.log('   - Includes onboarding checklist and contact information');

  } catch (error) {
    console.error('\n❌ Failed to send welcome email:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Email configuration incomplete')) {
      console.log('\n📝 Make sure you have configured the following in your .env file:');
      console.log('   EMAIL_USER=your-email@gmail.com');
      console.log('   EMAIL_PASSWORD=your-app-specific-password');
      console.log('   EMAIL_HOST=smtp.gmail.com (optional)');
      console.log('   EMAIL_PORT=587 (optional)');
      console.log('   FROM_NAME=Your Company Name (optional)');
      console.log('   FROM_EMAIL=your-email@gmail.com (optional)');
    }
    
    process.exit(1);
  }
};

// Run the test
testWelcomeEmail();
