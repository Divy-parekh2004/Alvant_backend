const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { sendOTPEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev_admin_secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'smartboy728382@gmail.com'; // Admin email from .env

// POST /api/admin/request-otp
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Only allow the predefined admin email
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        error: 'Unauthorized email address. Please use the registered admin email.' 
      });
    }

    // Check database connection
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected. Please check your MongoDB connection.' 
      });
    }

    // Find or create admin with this email
    let admin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new Admin({ email: ADMIN_EMAIL });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    admin.otp = otp;
    admin.otpExpires = expires;
    await admin.save();

    // Send OTP via email
    try {
      await sendOTPEmail(ADMIN_EMAIL, otp);
      // console.log(`✅ OTP sent to ${ADMIN_EMAIL}: ${otp}`);
    } catch (emailErr) {
      console.error('⚠️ Failed to send OTP email:', emailErr?.message || emailErr);
      // In development, still log OTP even if email fails
      // console.log(`📧 OTP for ${ADMIN_EMAIL} (email sending failed): ${otp}`);
      // Don't fail the request - allow login via console OTP in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Failed to send OTP email. Please check email configuration.' });
      }
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, remember } = req.body || {};
    if (!email || !email.trim() || !otp || !otp.toString().trim()) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Only allow the predefined admin email
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        error: 'Unauthorized email address. Please use the registered admin email.' 
      });
    }

    // Check database connection
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected. Please check your MongoDB connection.' 
      });
    }

    const admin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!admin) return res.status(400).json({ error: 'Admin not found' });

    if (!admin.otp || !admin.otpExpires || new Date() > admin.otpExpires) {
      return res.status(400).json({ error: 'OTP expired or not requested' });
    }

    if (admin.otp !== otp.toString()) return res.status(400).json({ error: 'Invalid OTP' });

    // Create JWT token
    const payload = { id: admin._id, email: admin.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: remember ? '30d' : '6h' });

    // Clear OTP
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/verify-token - check token validity
router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' });
    const token = parts[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      res.json({ ok: true, admin: payload });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
