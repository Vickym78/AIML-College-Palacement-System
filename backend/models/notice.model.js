const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_role: { type: String, required: true },
  receiver_role: { type: String, default: 'student' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  attachment: { type: String, default: null },  // Cloudinary URL of attachment
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
