/**
 * Email Job Queue System
 * Manages delayed email sending with background processing
 */

const sendEmail = require('./sendEmail');

// In-memory job queue
const jobQueue = [];
let isProcessing = false;

// Job queue processor
const processQueue = async () => {
  if (isProcessing || jobQueue.length === 0) {
    return;
  }

  isProcessing = true;

  try {
    const now = Date.now();
    const readyJobs = jobQueue.filter(job => job.executeAt <= now);

    for (const job of readyJobs) {
      try {
        console.log(`📧 Processing job: ${job.id}`);
        
        if (job.type === 'email') {
          await sendEmail(job.emailOptions);
          console.log(`✓ Email job completed: ${job.id}`);
        }

        // Remove job from queue
        const index = jobQueue.indexOf(job);
        if (index > -1) {
          jobQueue.splice(index, 1);
        }
      } catch (error) {
        console.error(`✗ Job failed: ${job.id}`, error.message);
        
        // Retry logic - increment retry count
        job.retries = (job.retries || 0) + 1;
        if (job.retries >= 3) {
          // Remove after 3 failed attempts
          const index = jobQueue.indexOf(job);
          if (index > -1) {
            jobQueue.splice(index, 1);
          }
          console.error(`Job permanently failed after 3 retries: ${job.id}`);
        } else {
          // Reschedule for 30 seconds later
          job.executeAt = now + 30000;
          console.log(`Rescheduling job: ${job.id}`);
        }
      }
    }
  } finally {
    isProcessing = false;
  }
};

// Start queue processor - runs every 2 seconds for faster delivery
const startQueueProcessor = () => {
  setInterval(processQueue, 2000);
  console.log('📋 Email job queue processor started (checking every 2s)');
};

/**
 * Add email job to queue with optional delay
 * @param {Object} emailOptions - Email options (email, subject, html, message)
 * @param {Number} delaySeconds - Delay in seconds (default: 0)
 * @param {String} jobId - Unique job identifier
 */
const addEmailJob = (emailOptions, delaySeconds = 0, jobId = null) => {
  const id = jobId || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const executeAt = Date.now() + (delaySeconds * 1000);

  const job = {
    id,
    type: 'email',
    emailOptions,
    executeAt,
    createdAt: Date.now(),
    retries: 0
  };

  jobQueue.push(job);
  console.log(`📌 Job queued: ${id} (Execute in ${delaySeconds}s)`);

  return id;
};

/**
 * Add batch email job for multiple recipients
 * @param {Array} recipients - Array of email addresses
 * @param {String} subject - Email subject
 * @param {String} html - HTML content
 * @param {String} message - Plain text message
 * @param {Number} delaySeconds - Initial delay before first batch
 * @param {Number} intervalSeconds - Interval between batches (default: 30)
 * @param {Number} batchSize - Recipients per batch (default: 50)
 */
const addBatchEmailJob = (recipients, subject, html, message, delaySeconds = 0, intervalSeconds = 30, batchSize = 50) => {
  const batches = [];
  const jobIds = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize);
    const batchDelay = delaySeconds + (batchIndex * intervalSeconds);
    const jobId = `batch-${Date.now()}-${batchIndex}`;

    const emailOptions = {
      bcc: batch,
      subject,
      html,
      message
    };

    addEmailJob(emailOptions, batchDelay, jobId);
    jobIds.push(jobId);
  }

  console.log(`Batch job created with ${batches.length} batches`);
  return jobIds;
};

/**
 * Get queue status
 */
const getQueueStatus = () => {
  const pending = jobQueue.filter(job => job.executeAt > Date.now()).length;
  const ready = jobQueue.filter(job => job.executeAt <= Date.now()).length;

  return {
    totalJobs: jobQueue.length,
    pendingJobs: pending,
    readyJobs: ready,
    jobs: jobQueue.map(job => ({
      id: job.id,
      type: job.type,
      executeAt: new Date(job.executeAt),
      createdAt: new Date(job.createdAt),
      retries: job.retries
    }))
  };
};

/**
 * Clear queue (for testing)
 */
const clearQueue = () => {
  jobQueue.length = 0;
  console.log('Queue cleared');
};

module.exports = {
  startQueueProcessor,
  addEmailJob,
  addBatchEmailJob,
  getQueueStatus,
  clearQueue
};
