require('dotenv').config();
const { addEmailJob, addBatchEmailJob, getQueueStatus, startQueueProcessor } = require('./src/utils/emailJobQueue');
const generateWelcomeEmail = require('./src/utils/emailTemplates/welcomeTemplate');
const generateAnnouncementEmail = require('./src/utils/emailTemplates/announcementTemplate');

const testQueueSystem = async () => {
  console.log('\n========================================');
  console.log('📋 EMAIL JOB QUEUE SYSTEM TEST');
  console.log('========================================\n');

  // Start the queue processor
  startQueueProcessor();

  // Test 1: Single Email Job with 30-second delay
  console.log('\n--- TEST 1: Single Email (30s delay) ---');
  const employeeData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    employeeCode: 'EMP-2026-002',
    department: 'Human Resources',
    position: 'HR Specialist',
    dateOfJoining: new Date('2026-02-15')
  };

  const welcomeHtml = generateWelcomeEmail(employeeData);
  const jobId1 = addEmailJob({
    email: employeeData.email,
    subject: `Welcome to ${process.env.FROM_NAME || 'Our Company'}!`,
    html: welcomeHtml,
    message: `Welcome ${employeeData.firstName}! We're excited to have you join our team.`
  }, 30, `welcome-test-${Date.now()}`);

  console.log(`✓ Job added: ${jobId1}`);
  console.log(`  Recipient: ${employeeData.email}`);
  console.log(`  Delay: 30 seconds`);

  // Test 2: Batch Email Job
  console.log('\n--- TEST 2: Batch Email (Multiple Recipients) ---');
  
  const testRecipients = [
    'emp1@company.com',
    'emp2@company.com',
    'emp3@company.com',
    'emp4@company.com',
    'emp5@company.com'
  ];

  const announcementData = {
    title: 'Company Announcement',
    priority: 'High',
    type: 'General',
    content: 'This is a test announcement for batch email sending.',
    publishDate: new Date(),
    targetAudience: 'All Employees',
    departments: [],
    roles: [],
    attachments: []
  };

  const announcementHtml = generateAnnouncementEmail(announcementData, 'https://hr-portal.com');
  
  const jobIds = addBatchEmailJob(
    testRecipients,
    `[${announcementData.priority}] ${announcementData.title}`,
    announcementHtml,
    `New announcement: ${announcementData.content}`,
    0, // No initial delay
    10, // 10 seconds between batches (for testing)
    2  // 2 recipients per batch (for testing)
  );

  console.log(`✓ Batch job created with ${jobIds.length} batches`);
  console.log(`  Total recipients: ${testRecipients.length}`);
  console.log(`  Recipients per batch: 2`);
  console.log(`  Interval between batches: 10 seconds`);
  console.log(`  Job IDs: ${jobIds.join(', ')}`);

  // Display queue status
  console.log('\n--- QUEUE STATUS (Initial) ---');
  let status = getQueueStatus();
  console.log(`Total jobs: ${status.totalJobs}`);
  console.log(`Pending jobs: ${status.pendingJobs}`);
  console.log(`Ready jobs: ${status.readyJobs}`);
  console.log('\nJobs in queue:');
  status.jobs.forEach(job => {
    const timeUntil = new Date(job.executeAt).getTime() - Date.now();
    const seconds = Math.ceil(timeUntil / 1000);
    console.log(`  - ${job.id} (${seconds}s until execution, retries: ${job.retries})`);
  });

  // Monitor queue for 20 seconds
  console.log('\n--- MONITORING QUEUE (20 seconds) ---');
  let checkCount = 0;
  const monitorInterval = setInterval(() => {
    checkCount++;
    status = getQueueStatus();
    console.log(`\n[Check ${checkCount}] Total: ${status.totalJobs} | Pending: ${status.pendingJobs} | Ready: ${status.readyJobs}`);
    
    if (status.totalJobs === 0) {
      console.log('✓ All jobs processed!');
      clearInterval(monitorInterval);
      cleanup();
    }
  }, 5000);

  // Cleanup after 20 seconds
  setTimeout(() => {
    clearInterval(monitorInterval);
    cleanup();
  }, 20000);

  function cleanup() {
    console.log('\n========================================');
    console.log('✓ Test Complete');
    console.log('========================================\n');
    console.log('Queue Features Demonstrated:');
    console.log('  ✓ Single email with 30-second delay');
    console.log('  ✓ Batch email sending');
    console.log('  ✓ Queue status monitoring');
    console.log('  ✓ Job tracking and scheduling');
    console.log('  ✓ Background processing');
    console.log('\nNext Steps:');
    console.log('  1. Check API endpoint: GET /api/queue/status');
    console.log('  2. Create an employee to test welcome email');
    console.log('  3. Create an announcement with sendToAll=true');
    console.log('  4. Monitor queue status in real-time\n');
  }
};

// Run test
testQueueSystem().catch(console.error);
