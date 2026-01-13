const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');

// POST /api/contact - save a contact submission
router.post('/', async (req, res) => {
  console.log("CONTACT FORM DATA:", req.body);
  
  try {
    const { name, email, phone, message, categories } = req.body || {};
    
    // Validate required fields
    const errors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s\-\+\(\)]+$/;
    
    // Name validation
    if (!name || !name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    if (!email || !email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRe.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
    
    // Phone validation
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRe.test(phone.trim())) {
      errors.phone = 'Please provide a valid phone number';
    } else if (phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone number must contain at least 10 digits';
    }
    
    // Categories validation
    if (!Array.isArray(categories) || categories.length === 0) {
      errors.categories = 'Please select at least one category';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const contact = new Contact({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      phone: phone.trim(), 
      message: message ? message.trim() : '', 
      categories: Array.isArray(categories) ? categories : [] 
    });
    
    await contact.save();
    res.status(201).json({ message: 'Contact saved successfully' });
  } catch (err) {
    console.error('Contact submission error:', err);
    
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

// GET /api/contact - list submissions (protected)
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
