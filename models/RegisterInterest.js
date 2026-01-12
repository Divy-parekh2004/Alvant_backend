const mongoose = require('mongoose');

const RegisterInterestSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters long']
  },
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long']
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long']
  },
  jobTitle: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters long']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'] 
  },
  hasUAE: { 
    type: String, 
    required: [true, 'Please select an option for UAE business'],
    enum: ['Yes', 'No']
  },
  multiCountry: { 
    type: String, 
    required: [true, 'Please select an option for multi-country business'],
    enum: ['Yes', 'No']
  },
  lineOfBusiness: { 
    type: [String], 
    default: [], 
    validate: { 
      validator: v => Array.isArray(v) && v.length > 0, 
      message: 'Please select at least one line of business' 
    } 
  },
  categories: { type: [String], default: [] },
  productInterest: { 
    type: [String], 
    default: [], 
    validate: { 
      validator: v => Array.isArray(v) && v.length > 0, 
      message: 'Please select at least one product interest' 
    } 
  },
  markets: { type: [String], default: [] },
  services: { type: [String], default: [] },
  captcha: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RegisterInterest', RegisterInterestSchema);
