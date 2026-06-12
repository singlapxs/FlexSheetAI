const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true,
    match: /^[a-zA-Z0-9_]+$/ 
  },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'date', 'dropdown', 'image', 'formula'] 
  },
  options: [{ type: String }],
  formulaExpression: { type: String },
  dependencies: [{ type: String }],
  aggregationType: { 
    type: String, 
    enum: ['none', 'sum', 'avg', 'max', 'min'],
    default: 'none'
  },
  colorScale: { type: Boolean, default: false }
});

const registerSchema = new mongoose.Schema({
  workspaceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workspace', 
    required: true 
  },
  title: { type: String, required: true },
  columns: [columnSchema]
}, { timestamps: true });

module.exports = mongoose.model('Register', registerSchema);
