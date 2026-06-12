const express = require('express');
const router = express.Router({ mergeParams: true }); // to access workspaceId
const { getRegisters, createRegister, getRegisterById, updateRegister, deleteRegister } = require('../controllers/registerController');
const { protect } = require('../middleware/auth');

// Assuming /api/workspaces/:workspaceId/registers
router.route('/')
  .get(protect, getRegisters)
  .post(protect, createRegister);

router.route('/:id')
  .get(protect, getRegisterById)
  .put(protect, updateRegister)
  .delete(protect, deleteRegister);

module.exports = router;
