const nodemailer = require('nodemailer');

// Create transporter using environment variables or default Gmail settings
const createTransporter = () => {
  // If SMTP credentials are provided in env, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Default: Use Gmail with app password (requires Gmail app password)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'smartboy728382@gmail.com',
      pass: process.env.EMAIL_PASS, // Gmail app password required
    },
  });
};

/**
 * Send OTP email to admin
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<void>}
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'smartboy728382@gmail.com',
      to: email,
      subject: 'Admin Dashboard Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Admin Dashboard Login</h2>
          <p>Your OTP code for admin dashboard login is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP is valid for 5 minutes.</p>
          <p style="color: #666;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
      text: `Your OTP code for admin dashboard login is: ${otp}. This OTP is valid for 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOTPEmail };
