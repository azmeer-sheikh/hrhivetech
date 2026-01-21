# Auto Email Queue System - Quick Reference

## ✅ System is Automatic & Always Running

The email queue system is **fully integrated and automatic**. No separate commands needed!

---

## How It Works Automatically

### 1️⃣ Server Startup
When you start the backend server (`npm run dev` or `npm start`):
```
📋 Email job queue processor started
```
The queue processor automatically starts and monitors every 5 seconds for jobs to send.

### 2️⃣ Create Employee → Auto Welcome Email
```
1. You create an employee via API/Frontend
2. Employee is saved immediately
3. API returns instantly with success
4. Welcome email is queued with 30-second delay
5. After 30 seconds, email is automatically sent in background
```

**Example Request:**
```json
POST /api/employees
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "position": "Developer"
}
```

**Response (Instant):**
```json
{
  "success": true,
  "data": { /* employee data */ },
  "message": "Employee created successfully. Welcome email will be sent in 30 seconds."
}
```

---

### 3️⃣ Create Announcement → Auto Send to All
```
1. You create announcement with sendToAll: true
2. Announcement is saved immediately
3. API returns instantly
4. Emails are queued in batches
5. First batch sent at 0 seconds
6. Next batch every 30 seconds automatically
```

**Example Request:**
```json
POST /api/announcements
{
  "title": "Important Company Update",
  "content": "...",
  "targetAudience": "All Employees",
  "sendToAll": true
}
```

**Response (Instant):**
```json
{
  "success": true,
  "data": {
    "title": "Important Company Update",
    "emailStatus": "queued_batch",
    "totalEmails": 150,
    "emailJobIds": ["batch-...", "batch-...", "batch-..."]
  },
  "message": "Announcement created successfully. Emails will be sent in background."
}
```

---

## What Happens Behind the Scenes

### Welcome Email (30-second delay)
```
T+0s:  User creates employee
       ✓ Employee saved
       ✓ Job queued: "welcome-emp123" (execute at T+30s)
       ✓ API returns immediately

T+5s:  Queue processor checks
       └─ Not ready yet (25 seconds remaining)

T+10s: Queue processor checks
       └─ Not ready yet (20 seconds remaining)

T+30s: Queue processor checks
       ✓ Job is ready!
       ✓ Email sent to employee
       ✓ Job removed from queue
```

### Announcement Email (Batch processing every 30 seconds)
```
T+0s:  User creates announcement (150 recipients)
       ✓ Announcement saved
       ✓ Job 1 queued: 50 recipients (execute at T+0s)
       ✓ Job 2 queued: 50 recipients (execute at T+30s)
       ✓ Job 3 queued: 50 recipients (execute at T+60s)
       ✓ API returns immediately

T+0s:  Queue processor checks
       ✓ Job 1 ready!
       ✓ Batch 1: 50 emails sent
       ✓ Job 1 removed

T+30s: Queue processor checks
       ✓ Job 2 ready!
       ✓ Batch 2: 50 emails sent
       ✓ Job 2 removed

T+60s: Queue processor checks
       ✓ Job 3 ready!
       ✓ Batch 3: 50 emails sent
       ✓ Job 3 removed
```

---

## Queue Processing Timeline

```
Server Start
    ↓
📋 Email job queue processor started
    ↓
Queue processor runs every 5 seconds
    ↓
Checks for jobs where executeAt <= now
    ↓
If job ready: Send email(s)
If job failed: Retry up to 3 times
If still failed: Log error and remove
    ↓
Continue monitoring...
```

---

## Monitor Queue Status Anytime

Check what jobs are pending or ready:

```bash
GET /api/queue/status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 3,
    "pendingJobs": 2,
    "readyJobs": 1,
    "jobs": [
      {
        "id": "welcome-emp123",
        "type": "email",
        "executeAt": "2026-01-22T10:35:00Z",
        "createdAt": "2026-01-22T10:34:30Z",
        "retries": 0
      }
    ]
  }
}
```

---

## Console Logs (What You'll See)

When server starts:
```
📋 Email job queue processor started
```

When employee is created:
```
📌 Job queued: welcome-emp123 (Execute in 30s)
✓ Welcome email queued for john@company.com (Job ID: welcome-emp123)
```

When announcement is created:
```
📦 Batch job created with 3 batches
📌 Job queued: batch-1234567890-0 (Execute in 0s)
📌 Job queued: batch-1234567890-1 (Execute in 30s)
📌 Job queued: batch-1234567890-2 (Execute in 60s)
```

When email is being sent:
```
📧 Processing job: batch-1234567890-0
✓ Email job completed: batch-1234567890-0
```

---

## Configuration

All timing is configured in `src/utils/emailJobQueue.js`:

```javascript
// Queue processor runs every 5 seconds
setInterval(processQueue, 5000);

// Employee welcome email delay
const delaySeconds = 30;

// Announcement batch settings
const batchSize = 50;              // Recipients per batch
const intervalSeconds = 30;         // Seconds between batches
const maxRetries = 3;              // Retry failed emails 3 times
```

---

## No Production Setup Needed!

✅ **Works Out of the Box**
- Just start the backend server
- Everything else is automatic
- No cron jobs needed
- No separate queue service needed
- No database persistence required (in-memory queue)

✅ **Features Included**
- Automatic 30-second delay for welcome emails
- Automatic batch sending every 30 seconds for announcements
- Automatic retry logic (up to 3 times)
- Queue status monitoring via API
- Console logging for debugging

---

## What Triggers Automatic Email Sending?

### 1. Create Employee
```
POST /api/employees → Welcome email queued (30s delay)
```

### 2. Create Announcement with sendToAll
```
POST /api/announcements { sendToAll: true } → Batch emails queued
```

---

## How to Test in Production

1. **Create an Employee:**
   ```
   POST /api/employees
   { firstName: "Test", email: "test@company.com", ... }
   ```
   → Welcome email will be sent in 30 seconds

2. **Create Announcement:**
   ```
   POST /api/announcements
   { title: "Test", sendToAll: true, ... }
   ```
   → Emails will be sent in batches

3. **Check Queue Status:**
   ```
   GET /api/queue/status
   ```
   → See all pending jobs

---

## Troubleshooting

### Queue Processor Not Starting?
```
Check server logs for:
📋 Email job queue processor started
```

### Jobs Not Being Sent?
```
1. Check queue status: GET /api/queue/status
2. Look for jobs in pending or ready state
3. Check console logs for errors
```

### Want to Clear Queue (Testing)?
```
DELETE /api/queue/clear
Authorization: Bearer <admin_token>
```

---

## Summary

✅ **Complete automated solution:**
- Employees get welcome emails automatically (30s delay)
- Announcements send to all automatically (30s batch intervals)
- Queue processes in background continuously
- No manual intervention needed
- Production-ready
- Fully integrated with existing system

Just start the server and everything works! 🚀
