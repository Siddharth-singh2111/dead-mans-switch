const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  trusteeEmail: { type: String, required: true },
  serverKeyPart: { type: String, required: true },
  iv: { type: String, required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  
  lastCheckIn: { type: Date, default: Date.now },
  checkInInterval: { type: Number, required: true }, // <--- THIS LINE IS KEY
  status: { type: String, default: 'alive' } // 'alive', 'executed'
});

module.exports = mongoose.model('User', UserSchema);