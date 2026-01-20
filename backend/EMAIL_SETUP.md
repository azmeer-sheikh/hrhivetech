# Email Announcement Setup Guide

This document explains how the email announcement system works and how to configure it properly.

## Overview

When you create an announcement in the HR Portal, the system automatically sends email notifications to all users in the target audience (all employees, specific departments, roles, or management).

## Email Configuration

The system uses **Google Service Account OAuth2** authentication to send emails via Gmail API. This is more secure and reliable than traditional SMTP with app passwords.

### Prerequisites

1. Google Cloud Project with Gmail API enabled
2. Service Account with proper permissions
3. Domain-wide delegation configured (if using Google Workspace)

## Setup Instructions

### 1. Google Service Account Credentials

The service account credentials are stored in `backend/config/google-credentials.json`. This file is automatically ignored by git for security.

The credentials file contains:
- `client_email`: Service account email
- `private_key`: Service account private key
- `project_id`: Google Cloud project ID
- Other OAuth2 configuration

### 2. Environment Variables

Update your `.env` file with the following:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com  # The Gmail address to send from
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Google Service Account (path to credentials file)
GOOGLE_SERVICE_ACCOUNT_PATH=./backend/config/google-credentials.json

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

### 3. Google Workspace Domain-Wide Delegation (if applicable)

If you're using Google Workspace and want to send emails on behalf of users in your domain:

1. Go to Google Admin Console
2. Navigate to Security → API Controls → Domain-wide Delegation
3. Add your service account's Client ID
4. Grant the following scope:
   ```
   https://www.googleapis.com/auth/gmail.send
   ```

## How It Works

### Creating an Announcement

When you create an announcement via the API (`POST /api/announcements`):

1. The announcement is saved to the database
2. The system determines the target audience:
   - **All Employees**: Sends to all active employees
   - **Specific Department**: Sends to employees in selected departments
   - **Specific Role**: Sends to users with selected roles
   - **Management Only**: Sends to admins, HR, and managers
3. Email notifications are sent to all recipients using BCC (blind carbon copy)
4. Each email includes:
   - Announcement title and priority
   - Full content with HTML formatting
   - Link to view in the HR Portal
   - Attachments (if any)

### Email Template

The email includes:
- **Priority badge** (Urgent/High/Medium/Low) with color coding
- **Announcement type** (General, Policy, Event, etc.)
- **Publication date**
- **Full content** with proper formatting
- **Attachments** as clickable links
- **CTA button** to view in HR Portal

### Testing

To test the email functionality:

```bash
cd backend
node test-announcement-email.js
```

Make sure to set `TEST_EMAIL` in your `.env` file or the script will use `test@example.com`.

## Troubleshooting

### Error: "Google credentials file not found"

- Ensure `backend/config/google-credentials.json` exists
- Check that `GOOGLE_SERVICE_ACCOUNT_PATH` in `.env` points to the correct file

### Error: "invalid_grant" or "unauthorized_client"

- Verify the service account has Gmail API permissions in Google Cloud Console
- Check that domain-wide delegation is properly configured (for Workspace accounts)
- Ensure the `EMAIL_USER` is a valid Gmail/Workspace address

### Emails not being delivered

- Check spam/junk folder
- Verify the service account has proper Gmail API scopes
- Check Gmail API quotas in Google Cloud Console
- Review backend logs for specific error messages

### Fallback to SMTP

If the Google Service Account fails, the system automatically falls back to standard SMTP authentication using:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

## API Usage

### Create Announcement with Email

```javascript
POST /api/announcements

{
  "title": "Important Update",
  "content": "This is an important announcement...",
  "type": "General",
  "priority": "High",
  "targetAudience": "All Employees",
  "publishDate": "2026-01-20",
  "isPinned": false
}
```

### Test Email to Specific Address

```javascript
POST /api/announcements

{
  "title": "Test Announcement",
  "content": "Test content",
  "type": "General",
  "priority": "Medium",
  "targetAudience": "All Employees",
  "publishDate": "2026-01-20",
  "testEmail": "specific-email@example.com"  // Override recipients
}
```

## Security Notes

1. **Never commit** `google-credentials.json` to version control
2. The credentials file is already added to `.gitignore`
3. Keep your service account private key secure
4. Regularly rotate service account keys
5. Use environment variables for sensitive data

## Rate Limits

Gmail API has the following quotas:
- **Free accounts**: 100 emails per day
- **Google Workspace**: 2000 emails per day (may vary by plan)

If you need to send more emails, consider:
- Using batch processing
- Implementing a queue system
- Upgrading your Google Workspace plan

## Support

For issues or questions:
1. Check backend logs for error messages
2. Verify Google Cloud Console settings
3. Test with the provided test script
4. Review Gmail API documentation: https://developers.google.com/gmail/api
