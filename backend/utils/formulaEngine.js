const { evaluate } = require('mathjs');

/**
 * Evaluates a formula string against a given row's cells.
 * @param {string} formulaStr - The formula containing column keys in braces, e.g., "{quantity} * {unit_price}"
 * @param {Object} rowCells - A map/object of key-value pairs representing the row's data. e.g., { quantity: 10, unit_price: 5 }
 * @returns {number|null} - The evaluated numerical result, or null if an error occurs.
 */
function evaluateFormula(formulaStr, rowCells) {
  try {
    if (!formulaStr || typeof formulaStr !== 'string') return null;

    // Convert "{quantity} * {unit_price}" -> "quantity * unit_price"
    const mathjsExpression = formulaStr.replace(/\{([a-zA-Z0-9_]+)\}/g, '$1');

    // Build the scope object with current row values
    const scope = {};
    for (const [key, value] of Object.entries(rowCells)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          scope[key] = dateObj.getTime() / (1000 * 60 * 60 * 24);
          continue;
        }
      }
      scope[key] = Number(value) || 0;
    }

    // Safely evaluate using mathjs
    const result = evaluate(mathjsExpression, scope);

    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }

    return Number(result.toFixed(2));
  } catch (error) {
    console.error("Formula evaluation failed for expression:", formulaStr, error.message);
    return null;
  }
}

module.exports = { evaluateFormula };
