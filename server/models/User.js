// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  trusteeEmail: { type: String, required: true }, // Added this
  
  // Security Data
  serverKeyPart: { type: String, required: true }, 
  iv: { type: String, required: true },            
  
  // File Data
  filePath: { type: String, required: true },      
  originalName: { type: String, required: true },

  // Timer Data
  lastCheckIn: { type: Date, default: Date.now },
  checkInInterval: { type: Number, default: 30000 }, // Default 30 seconds for testing! (In real life: 30 days)
  status: { type: String, default: 'alive' } // 'alive' or 'executed'
});

module.exports = mongoose.model('User', UserSchema);