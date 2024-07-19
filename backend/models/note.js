const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  isArchived: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  backgroundColor: { type: String, default: '#ffffff' },
  reminder: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
