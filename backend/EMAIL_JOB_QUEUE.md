# Email Job Queue System Documentation

## Overview

The Email Job Queue System enables asynchronous, background email sending with batching capabilities. This system ensures that:

1. **Instant Response**: API requests return immediately without waiting for email sending
2. **Background Processing**: Emails are sent in the background with configurable delays
3. **Batch Handling**: Large email lists are automatically split into batches to avoid overwhelming the email service
4. **Retry Logic**: Failed emails are automatically retried up to 3 times
5. **Queue Monitoring**: Admin dashboard to monitor pending and sent emails

---

## Features

### 1. **Single Email with Delay**
- Send individual emails with a specified delay
- Perfect for welcome emails to new employees
- Default: 30-second delay before sending

### 2. **Batch Email Sending**
- Automatically splits large email lists into batches
- Configurable batch size (default: 50 recipients per batch)
- Configurable interval between batches (default: 30 seconds)
- Prevents email service throttling

### 3. **Automatic Retry**
- Failed emails are automatically retried
- Maximum 3 retry attempts per job
- Exponential backoff (30 seconds between retries)
- Failed jobs are logged for monitoring

### 4. **Real-time Monitoring**
- API endpoint to check queue status
- View pending and ready jobs
- Track job creation time and retry count
- Admin-only access

---

## Implementation Details

### Employee Welcome Email

**When**: Employee is created
**Delay**: 30 seconds
**What happens**:
1. Employee is created and saved to database
2. Welcome email is queued with 30-second delay
3. API returns immediately with success message
4. After 30 seconds, welcome email is automatically sent

**Example Response**:
```json
{
  "success": true,
  "data": { /* employee data */ },
  "message": "Employee created successfully. Welcome email will be sent in 30 seconds."
}
```

### Announcement Email Distribution

**When**: Announcement is created with `sendToAll: true`
**Processing**:
1. Announcement is created and saved to database
2. API returns immediately with announcement data
3. Emails are queued based on target audience
4. Emails are sent in batches every 30 seconds

**Batch Logic**:
```
If 150 employees selected:
- Batch 1: 50 recipients → sent at 0s
- Batch 2: 50 recipients → sent at 30s
- Batch 3: 50 recipients → sent at 60s
```

**Example Request**:
```json
{
  "title": "Company Announcement",
  "content": "...",
  "targetAudience": "All Employees",
  "sendToAll": true
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Company Announcement",
    "emailStatus": "queued_batch",
    "totalEmails": 150,
    "emailJobIds": ["batch-1234567890-0", "batch-1234567890-1", "batch-1234567890-2"]
  },
  "message": "Announcement created successfully. Emails will be sent in background."
}
```

---

## API Endpoints

### 1. Check Queue Status
```
GET /api/queue/status
Authorization: Bearer <admin_or_hr_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalJobs": 5,
    "pendingJobs": 3,
    "readyJobs": 2,
    "jobs": [
      {
        "id": "welcome-emp123",
        "type": "email",
        "executeAt": "2026-01-22T10:30:45.123Z",
        "createdAt": "2026-01-22T10:30:15.123Z",
        "retries": 0
      }
    ]
  }
}
```

### 2. Clear Queue (Testing Only)
```
DELETE /api/queue/clear
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "message": "Queue cleared successfully"
}
```

---

## Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
FROM_NAME=HR Portal
FROM_EMAIL=hr@company.com
```

### Queue Processor Settings

In `src/utils/emailJobQueue.js`:

```javascript
// Run queue processor every 5 seconds
setInterval(processQueue, 5000);

// Default batch size
const batchSize = 50;

// Default interval between batches
const intervalSeconds = 30;

// Maximum retry attempts
const maxRetries = 3;
```

---

## Job States

### Pending
- Job is queued but execution time hasn't arrived yet
- Will be executed at scheduled `executeAt` time

### Ready
- Job is ready to execute
- Will be processed on next queue cycle

### In Progress
- Job is currently being sent
- Email service is handling the request

### Completed
- Email sent successfully
- Job is removed from queue

### Failed
- Email sending failed
- Job is retried up to 3 times
- If all retries fail, job is removed and logged

---

## Usage Examples

### Example 1: Create Employee (Auto-sends Welcome Email)

```javascript
// Frontend Request
const response = await fetch('/api/employees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com',
    // ... other employee data
  })
});

// Response returns immediately
// Welcome email will be sent after 30 seconds
```

### Example 2: Create Announcement (Send to All)

```javascript
// Frontend Request
const response = await fetch('/api/announcements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Company Update',
    content: 'Important announcement...',
    targetAudience: 'All Employees',
    sendToAll: true  // Enable background email sending
  })
});

// Response returns immediately
// Emails are queued and sent in batches every 30 seconds
```

### Example 3: Check Queue Status

```javascript
// Frontend Request
const response = await fetch('/api/queue/status', {
  headers: { 'Authorization': 'Bearer ' + token }
});

const data = await response.json();
console.log(`Pending jobs: ${data.data.pendingJobs}`);
console.log(`Ready to send: ${data.data.readyJobs}`);
```

---

## Monitoring & Logs

### Console Output

The system logs all queue operations:

```
📋 Email job queue processor started
📌 Job queued: welcome-emp123 (Execute in 30s)
📧 Processing job: welcome-emp123
✓ Email job completed: welcome-emp123
```

### Queue Status Indicators

- `📌` - Job queued
- `📧` - Job processing
- `✓` - Job completed
- `✗` - Job failed
- `📦` - Batch job created
- `📋` - Queue processor started

---

## Error Handling

### Email Send Failure

```javascript
// On first failure:
Job is added back to queue with executeAt = now + 30000ms

// On second failure:
Job is added back to queue with executeAt = now + 30000ms

// On third failure:
Job is removed from queue and logged as permanently failed
```

### Logging

All errors are logged to console with:
- Job ID
- Error message
- Retry count
- Timestamp

---

## Best Practices

1. **Use Batch Sending for Large Groups**: Always use `sendToAll: true` when sending to multiple employees
2. **Monitor Queue Status**: Regularly check `/api/queue/status` to ensure emails are being processed
3. **Test First**: Use `testEmail` parameter to send single test email before full broadcast
4. **Set Appropriate Delays**: 30 seconds is optimal balance between responsiveness and email delivery
5. **Batch Size**: 50 recipients per batch is recommended for Gmail/Office 365

---

## Troubleshooting

### Queue Not Processing

1. Check if processor was started:
   ```
   // In server logs, look for:
   📋 Email job queue processor started
   ```

2. Verify email configuration in `.env`

3. Check queue status:
   ```
   GET /api/queue/status
   ```

### Jobs Stuck in Queue

1. Check job status: `GET /api/queue/status`
2. If jobs are old and not executing, clear queue: `DELETE /api/queue/clear`
3. Restart server

### Email Not Sending

1. Verify email credentials in `.env`
2. Check email service isn't blocking requests
3. Review error in console logs
4. Check `/api/queue/status` for failed jobs

---

## Future Enhancements

1. **Database Persistence**: Store job queue in MongoDB
2. **Email Templates**: Database-driven template management
3. **Schedule Emails**: Schedule emails for future dates/times
4. **Delivery Status**: Track email delivery and open rates
5. **Webhook Integration**: Send webhooks on job completion
6. **Admin Dashboard**: Real-time UI for queue monitoring
7. **Job Cancellation**: Cancel pending jobs before execution

---

## Version History

- **v1.0.0** (2026-01-22): Initial release
  - Single email with delay
  - Batch email sending
  - Automatic retry logic
  - Queue status monitoring
