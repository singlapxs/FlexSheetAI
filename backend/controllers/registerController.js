const Register = require('../models/Register');

const getRegisters = async (req, res) => {
  try {
    const registers = await Register.find({ workspaceId: req.params.workspaceId });
    res.json(registers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRegister = async (req, res) => {
  try {
    const { title, columns } = req.body;
    const workspaceId = req.params.workspaceId;
    const register = await Register.create({
      workspaceId,
      title,
      columns
    });
    res.status(201).json(register);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegisterById = async (req, res) => {
  try {
    const register = await Register.findById(req.params.id);
    if (!register) return res.status(404).json({ message: 'Register not found' });
    res.json(register);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegister = async (req, res) => {
  try {
    const register = await Register.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(register);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRegister = async (req, res) => {
  try {
    const register = await Register.findById(req.params.id);
    if (!register) return res.status(404).json({ message: 'Register not found' });
    await register.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRegisters, createRegister, getRegisterById, updateRegister, deleteRegister };
