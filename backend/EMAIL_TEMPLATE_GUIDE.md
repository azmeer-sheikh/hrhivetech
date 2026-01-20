# Modern HR Announcement Email Template Guide

## Overview

The HR Portal now uses a modern, professional email template for all announcement notifications. This template is based on contemporary email design principles with a clean, responsive layout that works across all email clients.

## Features

### 🎨 Visual Design
- **Modern Layout**: Clean, card-based design with proper spacing and hierarchy
- **Responsive**: Optimized for both desktop and mobile email clients
- **Professional Typography**: Uses Inter and JetBrains Mono fonts with fallbacks
- **Color-Coded Priorities**: Visual indicators for Urgent, High, Medium, and Low priority announcements

### 📱 Email Client Compatibility
- Outlook (Windows, Mac, Web)
- Gmail (Web, iOS, Android)
- Apple Mail
- Mobile email clients
- Dark mode support

### ✨ Key Components

#### 1. Priority Badge
Dynamic status badge at the top showing announcement priority with:
- Color-coded backgrounds (red for Urgent, orange for High, blue for Medium, green for Low)
- Animated pulse indicator
- Uppercase, bold text

#### 2. Content Areas
- **Title Section**: Large, prominent heading with emoji icon based on announcement type
- **Date & Type**: Formatted metadata
- **Main Content**: Rich text with proper line spacing
- **Attachments**: Styled list with file icons (if applicable)
- **Target Audience**: Special section showing who the announcement is for (if not "All Employees")
- **Expiry Notice**: Warning banner if announcement has an expiration date

#### 3. Call-to-Action
- Prominent "Open HR Portal" button
- Direct link to view the full announcement
- Hover effects (in supported clients)

#### 4. Footer
- Professional HR Portal branding
- Copyright information
- System message disclaimer

## Priority Colors

| Priority | Background | Border | Text | Pulse |
|----------|-----------|--------|------|-------|
| **Urgent** | `#fef2f2` | `#fecaca` | `#991b1b` | `#ef4444` |
| **High** | `#fff7ed` | `#fed7aa` | `#9a3412` | `#f97316` |
| **Medium** | `#eff6ff` | `#bfdbfe` | `#1e40af` | `#3b82f6` |
| **Low** | `#f0fdf4` | `#bbf7d0` | `#166534` | `#22c55e` |

## Announcement Type Icons

| Type | Icon |
|------|------|
| General | 📢 |
| Policy Update | 📋 |
| Event | 📅 |
| Holiday | 🎉 |
| Training | 📚 |
| System Update | ⚙️ |
| Emergency | 🚨 |

## Template Structure

```
┌─────────────────────────────────┐
│  Preview Text (hidden)          │
├─────────────────────────────────┤
│  Priority Badge                 │
│  HR PORTAL Logo                 │
├─────────────────────────────────┤
│  📢 Emoji Icon                  │
│  Announcement Title             │
│  Type • Date                    │
├─────────────────────────────────┤
│  Main Content                   │
│  (formatted with line breaks)   │
├─────────────────────────────────┤
│  📎 Attachments (if any)        │
├─────────────────────────────────┤
│  👥 Target Audience (if specific)│
├─────────────────────────────────┤
│  ⏰ Expiry Notice (if applicable)│
├─────────────────────────────────┤
│  View Full Details              │
│  [Open HR Portal] Button        │
├─────────────────────────────────┤
│  Footer                         │
│  HR Portal System               │
│  Copyright © 2026               │
└─────────────────────────────────┘
```

## Usage

### Automatic Sending

The template is automatically used when creating announcements through the HR Portal API:

```javascript
POST /api/announcements

{
  "title": "New Policy Update",
  "type": "Policy Update",
  "priority": "High",
  "content": "Policy details here...",
  "targetAudience": "All Employees",
  "publishDate": "2026-01-21"
}
```

### Testing

Test the email template using the test script:

```bash
# Set up environment variables first
# TEST_EMAIL=your-email@example.com

# Run test
node test-announcement-email.js
```

The test will send a sample announcement email with:
- High priority
- Multiple attachments
- Rich content formatting
- Expiry date

### Manual Usage

To use the template programmatically:

```javascript
const generateAnnouncementEmail = require('./src/utils/emailTemplates/announcementTemplate');

const announcement = {
  _id: 'announcement-id',
  title: 'Your Title',
  type: 'General',
  priority: 'High',
  content: 'Your content...',
  publishDate: new Date(),
  targetAudience: 'All Employees',
  departments: [],
  attachments: [],
  expiryDate: null
};

const portalUrl = 'https://your-portal.com';
const htmlContent = generateAnnouncementEmail(announcement, portalUrl);

// Send via your email service
await sendEmail({
  email: 'recipient@example.com',
  subject: 'Your Subject',
  html: htmlContent,
  message: 'Plain text version...'
});
```

## Customization

### Modifying Colors

Edit the `priorityColors` object in [announcementTemplate.js](./src/utils/emailTemplates/announcementTemplate.js):

```javascript
const priorityColors = {
  Urgent: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', pulse: '#ef4444' },
  // Add or modify priorities here
};
```

### Adding New Announcement Types

Add new types to the `typeIcons` object:

```javascript
const typeIcons = {
  'General': '📢',
  'Your New Type': '🆕',
  // Add more types here
};
```

### Changing Fonts

Modify the Google Fonts import in the template:

```html
<link
  href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

## Best Practices

### Content Writing

1. **Keep titles concise**: 5-10 words maximum
2. **Use clear language**: Avoid jargon and acronyms
3. **Break up long text**: Use paragraphs and line breaks
4. **Include action items**: Be specific about what employees need to do
5. **Set appropriate priority**: 
   - Urgent: Immediate action required
   - High: Important, review within 24 hours
   - Medium: Review within a few days
   - Low: FYI, no immediate action needed

### Attachment Guidelines

- Limit to 3-5 attachments maximum
- Use descriptive file names
- Ensure files are accessible via provided URLs
- Keep total attachment size reasonable

### Target Audience

- Use "All Employees" for company-wide announcements
- Specify departments for department-specific news
- Use "Management Only" for leadership communications
- Set expiry dates for time-sensitive announcements

## Troubleshooting

### Email Not Rendering Correctly

1. **Check email client**: Some clients have limited CSS support
2. **Verify HTML structure**: Ensure no unclosed tags
3. **Test in multiple clients**: Use services like Litmus or Email on Acid
4. **Fallback content**: Ensure plain text version is included

### Images Not Loading

1. **Check image URLs**: Ensure they're publicly accessible
2. **Use HTTPS**: Some clients block HTTP images
3. **Test different clients**: Some have image blocking by default

### Font Issues

- Fonts may fall back to Arial/Helvetica on some clients
- This is expected behavior and the template handles it gracefully
- The design remains readable with fallback fonts

## Support

For issues or questions about the email template:

1. Check this documentation
2. Review the template code: `src/utils/emailTemplates/announcementTemplate.js`
3. Test using: `node test-announcement-email.js`
4. Check email sending logs in the backend

## Version History

### v1.0 (January 2026)
- Initial modern template implementation
- Responsive design with mobile support
- Priority-based color coding
- Attachment and expiry support
- Target audience indicators
- Professional footer with branding
