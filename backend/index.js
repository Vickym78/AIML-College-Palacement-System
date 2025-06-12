const express = require('express');
const cors = require('cors');
const path = require("path");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model'); // Import user model
require('dotenv').config(); // Load .env variables

const app = express();

// Middleware
app.use(express.json());

// Setup CORS
app.use(cors({
  origin: '*', // ⚠️ Replace with frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use('/profileImgs', express.static(path.join(__dirname, 'public/profileImgs')));
app.use('/resume', express.static(path.join(__dirname, 'public/resumes')));
app.use('/offerLetter', express.static(path.join(__dirname, 'public/offerLetter')));

// Connect to MongoDB
const connectDB = require('./config/MongoDB');
connectDB();

// ✅ TPO / Management Admin Signup API
app.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, password, role, position, number } = req.body;
    console.log("Incoming Signup Payload:", { name, email, role, position, number });

    // Validate role
    if (!['tpo_admin', 'management_admin', 'superuser'].includes(role)) {
      return res.status(400).json({ msg: 'Only authorised roles allowed.' });
    }

    // Check if user with the same email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: 'Email already registered.' });
    }

    // Check if number exists (if required and unique)
    if (number) {
      const existingNumber = await User.findOne({ number });
      if (existingNumber) {
        return res.status(409).json({ msg: 'Number already registered.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new User({
      name,
      email,
      number,
      password: hashedPassword,
      role,
      tpoProfile: role === 'tpo_admin' ? { position } : undefined,
      managementProfile: role === 'management_admin' ? { position } : undefined,
    });

    await newUser.save();
    res.status(201).json({ msg: 'Signup successful!', userId: newUser._id });

  } catch (err) {
    console.error("❌ Error while saving user:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// ✅ Route Imports
app.use('/user', require('./routes/user.route'));
app.use('/student', require('./routes/student.route'));
app.use('/tpo', require('./routes/tpo.route'));
app.use('/management', require('./routes/management.route'));
app.use('/admin', require('./routes/superuser.route'));
app.use('/company', require('./routes/company.route'));


// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
