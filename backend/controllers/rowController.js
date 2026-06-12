const Row = require('../models/Row');
const Register = require('../models/Register');
const { evaluateFormula } = require('../utils/formulaEngine');

const getRows = async (req, res) => {
  try {
    const rows = await Row.find({ registerId: req.params.registerId }).sort({ order: 1, createdAt: 1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRow = async (req, res) => {
  try {
    const { registerId } = req.params;
    let cells = req.body.cells || {};
    
    // Fetch register to get column definitions
    const register = await Register.findById(registerId);
    if (!register) return res.status(404).json({ message: 'Register not found' });

    // Handle formula fields
    register.columns.forEach(col => {
      if (col.type === 'formula' && col.formulaExpression) {
        cells[col.key] = evaluateFormula(col.formulaExpression, cells);
      }
    });

    // Find max order
    const lastRow = await Row.findOne({ registerId }).sort({ order: -1 });
    const order = lastRow && lastRow.order !== undefined ? lastRow.order + 1 : 0;

    const row = await Row.create({
      registerId,
      cells,
      order,
      updatedBy: req.user.id
    });
    
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRow = async (req, res) => {
  try {
    const { registerId, id } = req.params;
    let cells = req.body.cells;

    const register = await Register.findById(registerId);
    if (!register) return res.status(404).json({ message: 'Register not found' });

    // Handle formula fields
    register.columns.forEach(col => {
      if (col.type === 'formula' && col.formulaExpression) {
        cells[col.key] = evaluateFormula(col.formulaExpression, cells);
      }
    });

    const row = await Row.findByIdAndUpdate(id, { cells, updatedBy: req.user.id }, { new: true });
    res.json(row);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRow = async (req, res) => {
  try {
    const row = await Row.findById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Row not found' });
    await row.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderRows = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }
    if (!orders || !Array.isArray(orders)) return res.status(400).json({ message: 'Invalid orders data' });

    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order }
      }
    }));

    await Row.bulkWrite(bulkOps);
    res.json({ message: 'Rows reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRows, createRow, updateRow, deleteRow, reorderRows };
