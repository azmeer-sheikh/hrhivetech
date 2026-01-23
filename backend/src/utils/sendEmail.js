const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const sendEmail = async (options) => {
  let transporter;
  
  // Try to use Google Service Account first (requires domain-wide delegation)
  try {
    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
                           path.join(__dirname, '../../config/google-credentials.json');
    
    if (fs.existsSync(credentialsPath) && process.env.EMAIL_USER) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Create OAuth2 client with service account
      // Note: This requires domain-wide delegation to be set up in Google Workspace Admin
      const oauth2Client = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
        subject: process.env.EMAIL_USER, // Impersonate this user
      });

      // Get access token
      const tokens = await oauth2Client.authorize();

      // Create transporter with OAuth2
      transporter = nodemailer.createTransport({
        service: 'gmail',
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          serviceClient: credentials.client_id,
          privateKey: credentials.private_key,
          accessToken: tokens.access_token,
        },
      });

      console.log('✓ Using Google Service Account OAuth2 for email');
    } else {
      throw new Error('Google credentials file not found or EMAIL_USER not set');
    }
  } catch (error) {
    console.log('⚠ Google Service Account not available, falling back to SMTP:', error.message);
    
    // Fallback to standard SMTP configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email configuration incomplete. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT == 465,
      connectionTimeout: 10000, // 10 second connection timeout
      greetingTimeout: 10000, // 10 second greeting timeout  
      socketTimeout: 15000, // 15 second socket timeout
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    console.log('✓ Using SMTP authentication');
  }

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'HR Portal'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    subject: options.subject,
    text: options.message, // Plain text body
    html: options.html, // HTML body (optional)
  };

  if (options.email) {
    mailOptions.to = options.email;
  }
  
  if (options.bcc) {
    mailOptions.bcc = options.bcc;
  }

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
  return info;};

module.exports = sendEmail;