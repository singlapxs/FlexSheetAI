const Register = require('../models/Register');
const Row = require('../models/Row');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportExcel = async (req, res) => {
  try {
    const register = await Register.findById(req.params.registerId);
    if (!register) return res.status(404).json({ message: 'Register not found' });

    const rows = await Row.find({ registerId: req.params.registerId });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(register.title.substring(0, 31)); // Excel tab names limit 31 chars

    // Columns
    worksheet.columns = register.columns.map(col => ({
      header: col.label,
      key: col.key,
      width: 20
    }));

    // Rows
    rows.forEach(row => {
      worksheet.addRow(row.cells);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${register.title}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const register = await Register.findById(req.params.registerId);
    if (!register) return res.status(404).json({ message: 'Register not found' });

    const rows = await Row.find({ registerId: req.params.registerId });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${register.title}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`Register: ${register.title}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    // Simple table rendering
    const headers = register.columns.map(c => c.label).join(' | ');
    doc.text(headers, { underline: true });
    doc.moveDown(0.5);

    rows.forEach(row => {
      const rowString = register.columns.map(c => row.cells[c.key] || '-').join(' | ');
      doc.text(rowString);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportExcel, exportPDF };
