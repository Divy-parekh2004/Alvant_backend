const nodemailer = require('nodemailer');

// Cached transporter for reuse in serverless
let cachedTransporter = null;

// Create transporter using environment variables or default Gmail settings
const createTransporter = () => {
  // Return cached transporter if available
  if (cachedTransporter) {
    return cachedTransporter;
  }

  try {
    // If SMTP credentials are provided in env, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        pool: true, // Use pooled connections
        maxConnections: 1,
        maxMessages: 3,
      });
      return cachedTransporter;
    }

    // Default: Use Gmail with app password (requires Gmail app password)
    if (process.env.EMAIL_PASS) {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gmail app password required
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
      });
      return cachedTransporter;
    }

    // No email credentials configured
    console.warn('⚠️ Email credentials not configured. Email sending will fail.');
    return null;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message);
    return null;
  }
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

    // If no transporter available, log OTP instead
    if (!transporter) {
      console.warn('⚠️ Email service not configured. OTP:', otp);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Email service not configured');
      }
      // In development, just log the OTP
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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

    // Use timeout to prevent hanging in serverless
    const sendWithTimeout = Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      )
    ]);

    const info = await sendWithTimeout;
    console.log('✅ OTP email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);

    // In development, log OTP even if email fails
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 OTP (email failed):', otp);
      return; // Don't throw in development
    }

    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendOTPEmail };
