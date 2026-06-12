const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'CREATED_ROW', 'UPDATED_REGISTER'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true, enum: ['Workspace', 'Register', 'Row', 'User'] },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
