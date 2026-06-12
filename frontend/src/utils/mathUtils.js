import { evaluate } from 'mathjs';

export const evaluateFrontendFormula = (formulaStr, rowCells) => {
  try {
    if (!formulaStr) return null;
    const expression = formulaStr.replace(/\{([a-zA-Z0-9_]+)\}/g, '$1');
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
    
    const result = evaluate(expression, scope);
    if (!isFinite(result)) return null;
    return Number(result.toFixed(2));
  } catch (err) {
    return null;
  }
};
