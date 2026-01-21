/**
 * Modern Welcome Email Template for New Employees
 * Based on announcement template design with professional styling
 */

const generateWelcomeEmail = (employee) => {
  const formattedStartDate = employee.dateOfJoining 
    ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'your start date';

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
    <title>Welcome to ${process.env.FROM_NAME || 'Our Company'}!</title>

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
        Welcome to the team, ${employee.firstName}! We're excited to have you join us.
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
        <!-- Header with Welcome Badge -->
        <tr>
          <td style="padding: 30px 40px 0 40px; text-align: center">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <!-- Welcome Badge -->
                  <div
                    style="
                      display: inline-block;
                      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                      border: 1px solid #86efac;
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
                              background-color: #22c55e;
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
                            color: #166534;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                          "
                        >
                          NEW EMPLOYEE ONBOARDING
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Company Logo -->
                  <img
                    src="https://www.hivetechsols.com/assets/468aa9b0a5c7655ca4ff559abe5fcfdc42ac5232-DnWbXsot.png"
                    alt="HR Portal"
                    style="width: 140px; height: auto; display: block; margin: 0 auto 10px auto"
                  />
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
            <div style="font-size: 32px; margin-bottom: 10px">🎉</div>
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
              Welcome to the Team!
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
              ${employee.firstName} ${employee.lastName} • ${employee.position || 'Team Member'}
            </p>
          </td>
        </tr>

        <!-- Greeting Section -->
        <tr>
          <td
            class="mobile-pad"
            style="padding: 0 50px 30px 50px"
          >
            <div
              style="
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #334155;
              "
            >
              <p style="margin: 0 0 15px 0">
                Hello <strong>${employee.firstName}</strong>!
              </p>
              <p style="margin: 0 0 15px 0">
                Congratulations and welcome to ${process.env.FROM_NAME || 'our organization'}! 
                We are thrilled to have you join our team as <strong>${employee.position || 'a valuable team member'}</strong> 
                in the <strong>${employee.department || 'team'}</strong>.
              </p>
              <p style="margin: 0">
                Your skills and experience will be a great addition to our team, and we look forward to 
                working with you to achieve great things together.
              </p>
            </div>
          </td>
        </tr>

        <!-- Employee Information Card -->
        <tr>
          <td style="padding: 0 40px 30px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div
                    style="
                      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                      border: 1px solid #bfdbfe;
                      border-radius: 12px;
                      padding: 20px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 15px 0;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        color: #1e40af;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                      "
                    >
                      👤 YOUR EMPLOYEE INFORMATION
                    </p>
                    
                    <!-- Info Row 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #bfdbfe">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; font-weight: 500">
                                Employee Code:
                              </td>
                              <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right">
                                ${employee.employeeCode || 'TBD'}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Row 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #bfdbfe">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; font-weight: 500">
                                Department:
                              </td>
                              <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right">
                                ${employee.department || 'N/A'}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Row 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #bfdbfe">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; font-weight: 500">
                                Position:
                              </td>
                              <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right">
                                ${employee.position || 'N/A'}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Row 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #bfdbfe">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; font-weight: 500">
                                Start Date:
                              </td>
                              <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right">
                                ${formattedStartDate}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Row 5 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; font-weight: 500">
                                Email:
                              </td>
                              <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right">
                                ${employee.email}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Getting Started Checklist -->
        <tr>
          <td style="padding: 0 40px 30px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div
                    style="
                      background-color: #f8fafc;
                      border: 1px solid #e2e8f0;
                      border-radius: 12px;
                      padding: 20px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 15px 0;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        font-weight: 700;
                        color: #1e293b;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                      "
                    >
                      📋 GETTING STARTED CHECKLIST
                    </p>
                    
                    <!-- Checklist Item 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px">
                      <tr>
                        <td width="25" valign="top">
                          <div style="font-size: 16px">✅</div>
                        </td>
                        <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; line-height: 1.6">
                          <strong style="color: #1e293b">Complete your onboarding paperwork</strong> - HR will send you the necessary documents
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Checklist Item 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px">
                      <tr>
                        <td width="25" valign="top">
                          <div style="font-size: 16px">✅</div>
                        </td>
                        <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; line-height: 1.6">
                          <strong style="color: #1e293b">Set up your HR Portal account</strong> - You'll receive login credentials separately
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Checklist Item 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px">
                      <tr>
                        <td width="25" valign="top">
                          <div style="font-size: 16px">✅</div>
                        </td>
                        <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; line-height: 1.6">
                          <strong style="color: #1e293b">Review company policies</strong> - Available in the HR Portal under Documents
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Checklist Item 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="25" valign="top">
                          <div style="font-size: 16px">✅</div>
                        </td>
                        <td style="font-family: 'Inter', sans-serif; font-size: 13px; color: #475569; line-height: 1.6">
                          <strong style="color: #1e293b">Schedule your orientation</strong> - Your manager will reach out to coordinate
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Additional Message -->
        <tr>
          <td
            class="mobile-pad"
            style="padding: 0 50px 30px 50px"
          >
            <div
              style="
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #334155;
              "
            >
              <p style="margin: 0 0 15px 0">
                We've prepared everything for your arrival, and your team is excited to meet you. 
                If you have any questions before your start date, please don't hesitate to reach out.
              </p>
            </div>
          </td>
        </tr>

        <!-- Contact Info -->
        <tr>
          <td style="padding: 0 40px 30px 40px">
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
                          <div style="font-size: 16px">💬</div>
                        </td>
                        <td style="padding-left: 8px">
                          <p
                            style="
                              margin: 0 0 2px 0;
                              font-family: 'JetBrains Mono', monospace;
                              font-size: 10px;
                              font-weight: 700;
                              color: #92400e;
                              text-transform: uppercase;
                            "
                          >
                            NEED HELP?
                          </p>
                          <p
                            style="
                              margin: 0;
                              font-family: 'Inter', sans-serif;
                              font-size: 13px;
                              color: #78350f;
                            "
                          >
                            If you have any questions or need assistance, please contact our HR department at 
                            <strong>${process.env.FROM_EMAIL || 'hr@company.com'}</strong> or reply to this email.
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

        <!-- Closing Message -->
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
              <p style="margin: 0 0 15px 0">
                Once again, welcome aboard! We're looking forward to your contributions and to supporting 
                your growth with us.
              </p>
              <p style="margin: 0">
                <strong>Best regards,</strong><br />
                Human Resources Team<br />
                ${process.env.FROM_NAME || 'HR Portal'}
              </p>
            </div>
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
              Hive Tech Solutions HR Portal
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

module.exports = generateWelcomeEmail;
