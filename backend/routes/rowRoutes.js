const express = require('express');
const router = express.Router({ mergeParams: true });
const { getRows, createRow, updateRow, deleteRow, reorderRows } = require('../controllers/rowController');
const { protect } = require('../middleware/auth');

// /api/registers/:registerId/rows
router.route('/')
  .get(protect, getRows)
  .post(protect, createRow);

router.route('/reorder')
  .put(protect, reorderRows);

router.route('/:id')
  .put(protect, updateRow)
  .delete(protect, deleteRow);

module.exports = router;
