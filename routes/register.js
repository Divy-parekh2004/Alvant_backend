const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RegisterInterest = require('../models/RegisterInterest');

// POST /api/register - create a new register interest
router.post('/', async (req, res) => {
  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected', 
      details: 'Please check your MongoDB connection. Server is running but database is unavailable.' 
    });
  }

  try {
    const payload = req.body || {};
    // Validate all required fields with detailed error messages
    const errors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s\-\+\(\)]+$/;
    
    // Company Name validation
    if (!payload.companyName || !payload.companyName.trim()) {
      errors.companyName = 'Company name is required';
    } else if (payload.companyName.trim().length < 2) {
      errors.companyName = 'Company name must be at least 2 characters long';
    }
    
    // First Name validation
    if (!payload.firstName || !payload.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (payload.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    }
    
    // Last Name validation
    if (!payload.lastName || !payload.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (payload.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    }
    
    // Job Title validation
    if (!payload.jobTitle || !payload.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    } else if (payload.jobTitle.trim().length < 2) {
      errors.jobTitle = 'Job title must be at least 2 characters long';
    }
    
    // Phone validation
    if (!payload.phone || !payload.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRe.test(payload.phone.trim())) {
      errors.phone = 'Please provide a valid phone number';
    } else if (payload.phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone number must contain at least 10 digits';
    }
    
    // Email validation
    if (!payload.email || !payload.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRe.test(payload.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
    
    // hasUAE validation
    if (!payload.hasUAE || !payload.hasUAE.trim()) {
      errors.hasUAE = 'Please select an option';
    } else if (!['Yes', 'No'].includes(payload.hasUAE.trim())) {
      errors.hasUAE = 'Please select Yes or No';
    }
    
    // multiCountry validation
    if (!payload.multiCountry || !payload.multiCountry.trim()) {
      errors.multiCountry = 'Please select an option';
    } else if (!['Yes', 'No'].includes(payload.multiCountry.trim())) {
      errors.multiCountry = 'Please select Yes or No';
    }
    
    // Line of Business validation
    if (!Array.isArray(payload.lineOfBusiness) || payload.lineOfBusiness.length === 0) {
      errors.lineOfBusiness = 'Please select at least one line of business';
    }
    
    // Product Interest validation
    if (!Array.isArray(payload.productInterest) || payload.productInterest.length === 0) {
      errors.productInterest = 'Please select at least one product interest';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const doc = new RegisterInterest({
      companyName: payload.companyName.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      jobTitle: payload.jobTitle.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim().toLowerCase(),
      hasUAE: payload.hasUAE.trim(),
      multiCountry: payload.multiCountry.trim(),
      lineOfBusiness: Array.isArray(payload.lineOfBusiness) ? payload.lineOfBusiness : [],
      categories: Array.isArray(payload.categories) ? payload.categories : [],
      productInterest: Array.isArray(payload.productInterest) ? payload.productInterest : [],
      markets: Array.isArray(payload.markets) ? payload.markets : [],
      services: Array.isArray(payload.services) ? payload.services : [],
      captcha: payload.captcha || ''
    });

    const saved = await doc.save();

    res.status(201).json({ message: 'Registration saved', data: saved });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(err.errors).forEach(key => {
        validationErrors[key] = err.errors[key].message;
      });
      return res.status(400).json({ error: 'Validation error', errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry', details: 'This record already exists' });
    }
    
    // Generic server error
    res.status(500).json({ error: 'Server error', details: err.message || 'An unexpected error occurred' });
  }
});

// GET /api/register - list submissions (protected)
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => {
  try {
    const list = await RegisterInterest.find().sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
