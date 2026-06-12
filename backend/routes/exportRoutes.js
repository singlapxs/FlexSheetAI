const express = require('express');
const router = express.Router({ mergeParams: true });
const { exportExcel, exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/excel', protect, exportExcel);
router.get('/pdf', protect, exportPDF);

module.exports = router;
