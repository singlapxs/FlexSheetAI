const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
