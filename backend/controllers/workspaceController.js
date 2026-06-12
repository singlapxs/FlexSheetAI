const Workspace = require('../models/Workspace');

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user.id });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWorkspace = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ message: 'Please add a text field' });
  }
  try {
    const workspace = await Workspace.create({
      name: req.body.name,
      userId: req.user.id,
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    // Check for user
    if (workspace.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await workspace.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWorkspaces, createWorkspace, deleteWorkspace };
