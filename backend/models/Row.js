const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  registerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true,
  },
  cells: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  order: {
    type: Number,
    default: 0,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Row', rowSchema);
