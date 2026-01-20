/**
 * Modern HR Announcement Email Template
 * Based on modern email design with professional styling
 */

const generateAnnouncementEmail = (announcement, portalUrl) => {
  const priorityColors = {
    Urgent: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', pulse: '#ef4444' },
    High: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', pulse: '#f97316' },
    Medium: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', pulse: '#3b82f6' },
    Low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', pulse: '#22c55e' }
  };

  const typeIcons = {
    'General': '📢',
    'Policy Update': '📋',
    'Event': '📅',
    'Holiday': '🎉',
    'Training': '📚',
    'System Update': '⚙️',
    'Emergency': '🚨'
  };

  const priorityStyle = priorityColors[announcement.priority] || priorityColors.Medium;
  const typeIcon = typeIcons[announcement.type] || '📢';
  
  const formattedDate = new Date(announcement.publishDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html
  lang="en"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${announcement.title} - HR Portal</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
      rel="stylesheet"
    />
    <style type="text/css">
      /* RESET STYLES */
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        background-color: #f1f5f9;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table {
        border-spacing: 0;
        border-collapse: collapse;
      }
      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
        display: block;
      }
      a {
        text-decoration: none;
        color: #3b82f6;
      }

      /* UTILITIES */
      .wrapper {
        width: 100%;
        table-layout: fixed;
        background-color: #f1f5f9;
        padding-bottom: 40px;
      }
      .main-container {
        background-color: #ffffff;
        margin: 0 auto;
        width: 100%;
        max-width: 600px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -1px rgba(0, 0, 0, 0.03);
      }

      /* BUTTON HOVER */
      .btn-primary:hover {
        background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%) !important;
        box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important;
      }

      /* RESPONSIVE */
      @media screen and (max-width: 600px) {
        .main-container {
          width: 100% !important;
          border-radius: 0 !important;
        }
        .mobile-pad {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        .h1-mobile {
          font-size: 28px !important;
          line-height: 1.2 !important;
        }
      }
    </style>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f1f5f9">
    <center class="wrapper">
      <!-- Preview Text -->
      <div
        style="
          display: none;
          font-size: 1px;
          color: #f1f5f9;
          line-height: 1px;
          max-height: 0px;
          max-width: 0px;
          opacity: 0;
          overflow: hidden;
        "
      >
        ${announcement.title} - ${announcement.type} Announcement
      </div>

      <!-- Spacer -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td height="40"></td>
        </tr>
      </table>

      <!-- Main Container -->
      <table
        class="main-container"
        width="600"
        cellpadding="0"
        cellspacing="0"
        align="center"
        style="
          width: 600px;
          max-width: 600px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        "
      >
        <!-- Header with Status Badge -->
        <tr>
          <td style="padding: 30px 40px 0 40px; text-align: center">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <!-- Status Badge -->
                  <div
                    style="
                      display: inline-block;
                      background-color: ${priorityStyle.bg};
                      border: 1px solid ${priorityStyle.border};
                      border-radius: 50px;
                      padding: 6px 16px;
                      margin-bottom: 20px;
                    "
                  >
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div
                            style="
                              width: 8px;
                              height: 8px;
                              background-color: ${priorityStyle.pulse};
                              border-radius: 50%;
                              margin-right: 8px;
                            "
                          ></div>
                        </td>
                        <td
                          style="
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 11px;
                            font-weight: 700;
                            color: ${priorityStyle.text};
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                          "
                        >
                          ${announcement.priority} PRIORITY
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- HR Portal Logo/Title -->
                  <h3
                    style="
                      margin: 0;
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 14px;
                      font-weight: 700;
                      color: #1e293b;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                    "
                  >
                    HR PORTAL
                  </h3>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Title Section -->
        <tr>
          <td
            class="mobile-pad"
            style="padding: 30px 50px 30px 50px; text-align: center"
          >
            <div style="font-size: 32px; margin-bottom: 10px">${typeIcon}</div>
            <h1
              class="h1-mobile"
              style="
                margin: 0 0 15px 0;
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: -1px;
                color: #0f172a;
                line-height: 1.2;
              "
            >
              ${announcement.title}
            </h1>
            <p
              style="
                margin: 0;
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
              "
            >
              ${announcement.type} • ${formattedDate}
            </p>
          </td>
        </tr>

        <!-- Content Section -->
        <tr>
          <td
            class="mobile-pad"
            style="padding: 0 50px 40px 50px"
          >
            <div
              style="
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #334155;
              "
            >
              ${announcement.content.replace(/\n/g, '<br>')}
            </div>
          </td>
        </tr>

        ${announcement.attachments && announcement.attachments.length > 0 ? `
        <!-- Attachments Section -->
        <tr>
          <td class="mobile-pad" style="padding: 0 40px 40px 40px">
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
              "
            >
              <tr>
                <td style="padding: 20px">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom: 12px">
                        <p
                          style="
                            margin: 0;
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 10px;
                            font-weight: 700;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          📎 ATTACHMENTS
                        </p>
                      </td>
                    </tr>
                    ${announcement.attachments.map(att => `
                    <tr>
                      <td style="padding: 8px 0">
                        <a
                          href="${att.fileUrl}"
                          style="
                            font-family: 'Inter', sans-serif;
                            font-size: 14px;
                            color: #3b82f6;
                            text-decoration: none;
                            font-weight: 500;
                          "
                        >
                          📄 ${att.fileName}
                        </a>
                      </td>
                    </tr>
                    `).join('')}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${announcement.targetAudience !== 'All Employees' ? `
        <!-- Target Audience Info -->
        <tr>
          <td style="padding: 0 40px 40px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div
                    style="
                      background-color: #eff6ff;
                      border: 1px solid #bfdbfe;
                      border-radius: 8px;
                      padding: 12px 16px;
                    "
                  >
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="20" valign="top">
                          <div style="font-size: 16px">👥</div>
                        </td>
                        <td style="padding-left: 8px">
                          <p
                            style="
                              margin: 0 0 2px 0;
                              font-family: 'JetBrains Mono', monospace;
                              font-size: 10px;
                              font-weight: 700;
                              color: #1e40af;
                              text-transform: uppercase;
                            "
                          >
                            TARGET AUDIENCE
                          </p>
                          <p
                            style="
                              margin: 0;
                              font-family: 'Inter', sans-serif;
                              font-size: 13px;
                              color: #1e40af;
                            "
                          >
                            ${announcement.targetAudience}
                            ${announcement.departments && announcement.departments.length > 0 ? 
                              ` - ${announcement.departments.join(', ')}` : ''}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        ${announcement.expiryDate ? `
        <!-- Expiry Notice -->
        <tr>
          <td style="padding: 0 40px 40px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div
                    style="
                      background-color: #fef3c7;
                      border: 1px solid #fde68a;
                      border-radius: 8px;
                      padding: 12px 16px;
                    "
                  >
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="20" valign="top">
                          <div style="font-size: 16px">⏰</div>
                        </td>
                        <td style="padding-left: 8px">
                          <p
                            style="
                              margin: 0;
                              font-family: 'Inter', sans-serif;
                              font-size: 13px;
                              color: #92400e;
                            "
                          >
                            This announcement expires on <strong>${new Date(announcement.expiryDate).toLocaleDateString()}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- CTA Button -->
        <tr>
          <td style="padding: 20px 40px 50px 40px; text-align: center">
            <p
              style="
                margin: 0 0 20px 0;
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                font-weight: 600;
                color: #0f172a;
              "
            >
              View Full Details
            </p>
            <table align="center" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 8px">
                  <a
                    href="${portalUrl}/announcements/${announcement._id}"
                    target="_blank"
                    class="btn-primary"
                    style="
                      display: inline-block;
                      padding: 14px 40px;
                      background-color: #3b82f6;
                      color: #ffffff;
                      font-family: 'Inter', sans-serif;
                      font-size: 15px;
                      font-weight: 600;
                      text-decoration: none;
                      border-radius: 8px;
                    "
                  >
                    Open HR Portal
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td
            style="
              padding: 30px 40px;
              text-align: center;
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
            "
          >
            <p
              style="
                margin: 0 0 10px 0;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                font-weight: 700;
                color: #1e293b;
                letter-spacing: 1px;
                text-transform: uppercase;
              "
            >
              HR PORTAL SYSTEM
            </p>
            <p
              style="
                margin: 0 0 15px 0;
                font-family: 'Inter', sans-serif;
                font-size: 11px;
                color: #64748b;
              "
            >
              This is an automated message from the HR Portal.
              <br />Please do not reply to this email.
            </p>
            <p
              style="
                margin: 0;
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                color: #94a3b8;
              "
            >
              © ${new Date().getFullYear()} Human Resources Department. All rights reserved.
            </p>
          </td>
        </tr>
      </table>

      <!-- Bottom Spacer -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td height="40"></td>
        </tr>
      </table>
    </center>
  </body>
</html>
  `;
};

module.exports = generateAnnouncementEmail;
