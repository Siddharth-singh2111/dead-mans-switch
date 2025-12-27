// server/server.js
require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const User = require('./models/User');
const sendEmail = require('./emailService');

const app = express();
const fs = require('fs'); // <--- ADD THIS
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
// Now reads safely from your .env file
const MONGO_URI = process.env.MONGO_URI; 

// STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. CREATE VAULT

app.post('/api/upload', upload.single('encryptedFile'), async (req, res) => {
  try {
    // Read 'checkInInterval' from the request body
    const { email, trusteeEmail, serverKeyPart, iv, checkInInterval } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already has a vault." });

    const newUser = new User({
      email, trusteeEmail, serverKeyPart, iv,
      filePath: req.file.path,
      originalName: req.file.originalname,
      lastCheckIn: Date.now(),
      checkInInterval: parseInt(checkInInterval) // Ensure it is saved as a Number
    });
    
    await newUser.save();
    res.json({ message: 'Vault Created Successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 2. CHECK-IN
app.post('/api/checkin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.lastCheckIn = Date.now();
    user.status = 'alive';
    await user.save();
    console.log(`💓 User ${email} checked in.`);
    res.json({ message: "Check-in successful. Timer reset." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET METADATA
app.get('/api/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "Vault not found" });

    res.json({
      serverKeyPart: user.serverKeyPart,
      iv: user.iv,
      filename: path.basename(user.filePath),
      originalName: user.originalName,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DOWNLOAD
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});
// 5. KILL SWITCH (DELETE VAULT)
app.delete('/api/vault', async (req, res) => {
  try {
    const { email } = req.body; // In real app, verify password/token here
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ error: "Vault not found" });

    // 1. Delete the physical file
    if (user.filePath) {
      fs.unlink(user.filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }

    // 2. Delete the Database Record
    await User.deleteOne({ email });
    
    console.log(`🗑 Vault destroyed for ${email}`);
    res.json({ message: "Vault destroyed. You are free." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- INITIALIZATION ---
console.log("⏳ Connecting to MongoDB...");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');

    // 1. START THE REAPER (TIMER)
    // Only starts AFTER we are connected
    cron.schedule('*/10 * * * * *', async () => {
      // console.log('Checking for inactive users...');
      try {
        const users = await User.find({ status: 'alive' });
        const now = Date.now();

        for (const user of users) {
          const timeDiff = now - new Date(user.lastCheckIn).getTime();
          if (timeDiff > user.checkInInterval) {
            console.log(`💀 User ${user.email} expired. Triggering switch...`);
            
            user.status = 'executed';
            await user.save();

            const downloadLink = `http://localhost:5173/unlock`;
            const emailBody = `URGENT: ${user.email} is gone. Access vault here: ${downloadLink}`;
            
            await sendEmail(user.trusteeEmail, "Dead Man's Switch Triggered", emailBody);
          }
        }
      } catch (err) {
        console.error("Timer Error:", err.message);
      }
    });

    // 2. START THE SERVER
    const PORT = 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.log('❌ DB Connection Failed:', err);
  });