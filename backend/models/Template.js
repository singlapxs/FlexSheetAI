const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Finance', 'Inventory', 'HR', 'CRM', 'Other'], default: 'Other' },
  columns: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    formulaExpression: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
