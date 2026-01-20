require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');
const generateAnnouncementEmail = require('./src/utils/emailTemplates/announcementTemplate');

async function testAnnouncementEmail() {
  try {
    console.log('Testing announcement email functionality with modern template...\n');

    const testEmail = process.env.TEST_EMAIL;
    
    // Sample announcement object
    const sampleAnnouncement = {
      _id: 'test-announcement-id',
      title: 'New Employee Wellness Program Launch',
      type: 'General',
      priority: 'High',
      content: `We are excited to announce the launch of our new Employee Wellness Program!

Starting next month, all employees will have access to:

• Comprehensive health insurance with dental and vision coverage
• Monthly wellness workshops and seminars
• On-site fitness facilities and classes
• Mental health support and counseling services
• Flexible work arrangements for better work-life balance

This initiative reflects our commitment to your well-being and professional growth. We believe that a healthy and happy team is the foundation of our success.

Please attend the information session next Friday at 2:00 PM in the main conference room to learn more about these exciting benefits.`,
      publishDate: new Date(),
      targetAudience: 'All Employees',
      departments: [],
      attachments: [
        {
          fileName: 'Wellness-Program-Guide.pdf',
          fileUrl: 'https://example.com/documents/wellness-guide.pdf'
        },
        {
          fileName: 'Benefits-Overview.pdf',
          fileUrl: 'https://example.com/documents/benefits-overview.pdf'
        }
      ],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    const portalUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const htmlContent = generateAnnouncementEmail(sampleAnnouncement, portalUrl);
    
    const plainMessage = `
New Announcement: ${sampleAnnouncement.title}

Priority: ${sampleAnnouncement.priority}
Type: ${sampleAnnouncement.type}
Date: ${new Date(sampleAnnouncement.publishDate).toLocaleDateString()}

${sampleAnnouncement.content}

Attachments:
- Wellness-Program-Guide.pdf
- Benefits-Overview.pdf

Please log in to the HR Portal to view more details: ${portalUrl}/announcements/${sampleAnnouncement._id}
    `;

    console.log(`Sending test email to: ${testEmail}`);
    
    await sendEmail({
      email: testEmail,
      subject: '[High] New Employee Wellness Program Launch - HR Portal',
      message: plainMessage,
      html: htmlContent,
    });

    console.log('\n✅ Test email sent successfully with modern template!');
    console.log('Please check the recipient inbox to verify delivery.');
    console.log('\nThe email includes:');
    console.log('  • Modern, responsive design');
    console.log('  • Priority status badge');
    console.log('  • Rich content formatting');
    console.log('  • Attachment listing');
    console.log('  • Call-to-action button');
    console.log('  • Professional footer');
    
  } catch (error) {
    console.error('\n❌ Error sending test email:', error);
    console.error('\nPlease ensure:');
    console.error('1. Google Service Account credentials are properly configured');
    console.error('2. The service account has Gmail API permissions');
    console.error('3. Domain-wide delegation is set up if using Gmail on behalf of another user');
    console.error('4. EMAIL_USER environment variable is set to a valid Gmail address');
  }
}

testAnnouncementEmail();
