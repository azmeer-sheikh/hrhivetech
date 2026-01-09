const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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
};

module.exports = sendEmail;
