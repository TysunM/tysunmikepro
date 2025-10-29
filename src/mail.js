import nodemailer from 'nodemailer';
import { config } from './config.js';

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail configuration error:', error.message);
  } else {
    console.log('✅ Gmail is ready to send emails');
  }
});

export async function sendMail(to, subject, html) {
  try {
    const mailOptions = {
      from: config.mailFrom,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

