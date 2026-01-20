# Announcement Email Setup Guide

## Overview
This guide explains how to set up automatic email notifications for HR Portal announcements using Google Cloud credentials.

## Google Cloud Credentials Setup

You've been provided with the following credentials:

```
API Key: AIzaSyDtRXwaaz7LpvMK2igwRisM32xyPK5QL_8
Service Account Email: hr-portal@seismic-sweep-484121-t3.iam.gserviceaccount.com
Unique ID: 114153926133308064660
```

## Configuration Steps

### 1. Update Environment Variables
Add the following to your `.env` file in the `backend/` directory:

```bash
# Google Cloud Configuration (for announcement emails)
GOOGLE_API_KEY=AIzaSyDtRXwaaz7LpvMK2igwRisM32xyPK5QL_8
GOOGLE_SERVICE_ACCOUNT_EMAIL=hr-portal@seismic-sweep-484121-t3.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_ID=114153926133308064660

# Keep your existing email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_company_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 2. Email Configuration
Ensure you have valid SMTP credentials for email sending:
- **EMAIL_HOST**: SMTP server (gmail: smtp.gmail.com)
- **EMAIL_PORT**: SMTP port (gmail: 587)
- **EMAIL_USER**: Your email address
- **EMAIL_PASSWORD**: App-specific password (for Gmail)

### 3. Frontend URL Configuration
Add your frontend URL for email links:
```bash
FRONTEND_URL=http://localhost:5173
# Or for production: https://your-domain.com
```

## Announcement Email Features

### Automatic Email Sending
When you create an announcement, emails are automatically sent to employees based on the **Target Audience** setting:

1. **All Employees**
   - Sends to all active employees in the Employee database
   - Emails pulled from `Employee.email` field

2. **Specific Department**
   - Select departments in the announcement form
   - Only employees in those departments receive the email
   - Example: Engineering, HR, Sales, etc.

3. **Specific Role**
   - Select roles in the announcement form
   - Only users with those roles receive the email
   - Example: admin, hr, manager, employee

4. **Management Only**
   - Sends to admin, hr, and manager roles only

### Email Template
Each announcement email includes:
- ✅ Announcement title and priority badge
- ✅ Announcement type and date
- ✅ Full announcement content (with formatting)
- ✅ Attachments (if any)
- ✅ Direct link to view in HR Portal
- ✅ Professional HTML formatting
- ✅ Plain text fallback

### Test Email
During announcement creation, you can test the email functionality:
1. Set the `testEmail` field in the request body
2. The announcement will be created but email will only be sent to the test email address

Example API request:
```json
{
  "title": "Team Meeting Tomorrow",
  "content": "We have a team meeting scheduled for tomorrow at 2 PM",
  "priority": "High",
  "type": "Event",
  "targetAudience": "Specific Department",
  "departments": ["Engineering"],
  "testEmail": "test@example.com"
}
```

## API Endpoint

### Create Announcement with Auto Email
```
POST /api/announcements
```

**Request Body:**
```json
{
  "title": "Important Company Update",
  "content": "Lorem ipsum dolor sit amet...",
  "priority": "High",
  "type": "Policy Update",
  "targetAudience": "All Employees",
  "departments": [],
  "roles": [],
  "attachments": [],
  "expiryDate": "2026-12-31"
}
```

**Response:**
- Announcement is created in the database
- Emails are sent automatically to matching employees
- Success response is returned immediately

## Troubleshooting

### Emails Not Sending
1. Check environment variables are properly set
2. Verify SMTP credentials are correct
3. Check server logs: `console.error()` messages
4. Test with a `testEmail` first

### Invalid Email Addresses
- Emails are automatically filtered to remove empty/invalid addresses
- Check that Employee.email field is populated
- Verify User.email field is populated for role-based targeting

### Permission Issues
- Only admin/hr users can create announcements (checked via middleware)
- Verify user has appropriate role

### SMTP Connection Errors
For Gmail:
- Enable "Less secure app access" OR
- Use an [App Password](https://support.google.com/accounts/answer/185833) (recommended)
- Port 587 with TLS is preferred over 465

## File Structure
- **Controller**: [backend/src/controllers/announcementController.js](backend/src/controllers/announcementController.js)
- **Email Utility**: [backend/src/utils/sendEmail.js](backend/src/utils/sendEmail.js)
- **Model**: [backend/src/models/Announcement.js](backend/src/models/Announcement.js)
- **Employee Model**: [backend/src/models/Employee.js](backend/src/models/Employee.js)

## Security Notes
⚠️ **Important:**
- Never commit `.env` file to version control
- Store sensitive credentials securely
- Use app-specific passwords for Gmail (not account password)
- Rotate credentials periodically
- Limit API key permissions in Google Cloud Console

## Support
If announcements aren't being sent:
1. Check browser console for API errors
2. Check server logs for email sending errors
3. Verify employee/user email addresses exist
4. Test with a single test email first
