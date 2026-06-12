import React, { useState, useEffect } from 'react';
import { evaluateFrontendFormula } from '../utils/mathUtils';
import { Download, Share2, Edit2, Trash2, Printer, GripVertical } from 'lucide-react';

const SmartTable = ({ register, rows: initialRows, onRowUpdate, onRegisterUpdate, onEditColumnClick, onRowDelete, onRowReorder }) => {
  const [rows, setRows] = useState(initialRows);
  const [draggedColIdx, setDraggedColIdx] = useState(null);
  const [draggedRowIdx, setDraggedRowIdx] = useState(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // --- Drag and Drop: Columns ---
  const handleColDragStart = (e, index) => {
    setDraggedColIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedColIdx === null || draggedColIdx === targetIndex || !onRegisterUpdate) return;
    
    const newCols = [...register.columns];
    const [movedCol] = newCols.splice(draggedColIdx, 1);
    newCols.splice(targetIndex, 0, movedCol);
    
    onRegisterUpdate({ ...register, columns: newCols });
    setDraggedColIdx(null);
  };

  // --- Drag and Drop: Rows ---
  const handleRowDragStart = (e, index) => {
    setDraggedRowIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRowDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedRowIdx === null || draggedRowIdx === targetIndex || !onRowReorder) return;
    
    const newRows = [...rows];
    const [movedRow] = newRows.splice(draggedRowIdx, 1);
    newRows.splice(targetIndex, 0, movedRow);
    
    onRowReorder(newRows);
    setDraggedRowIdx(null);
  };

  const handleColumnDelete = (key) => {
    if (window.confirm('Are you sure you want to delete this column?')) {
      if (onRegisterUpdate) {
        const updatedCols = register.columns.filter(c => c.key !== key);
        onRegisterUpdate({ ...register, columns: updatedCols });
      }
    }
  };

  const handleCellChange = (rowIndex, colKey, value) => {
    const updatedRows = [...rows];
    const row = { ...updatedRows[rowIndex] };
    
    // Update the changed cell
    row.cells = { ...row.cells, [colKey]: value };

    // Reactively evaluate any formula columns
    register.columns.forEach(col => {
      if (col.type === 'formula' && col.formulaExpression) {
        row.cells[col.key] = evaluateFrontendFormula(col.formulaExpression, row.cells);
      }
    });

    updatedRows[rowIndex] = row;
    setRows(updatedRows);
    
    // Call parent handler to persist to backend
    if (onRowUpdate) {
      onRowUpdate(row);
    }
  };

  const getAggregationResult = (colKey, type, aggType) => {
    if ((type !== 'number' && type !== 'formula') || !aggType || aggType === 'none') return null;
    
    const values = rows.map(r => Number(r.cells[colKey]) || 0);
    if (values.length === 0) return 0;

    let res = 0;
    if (aggType === 'sum') {
      res = values.reduce((a, b) => a + b, 0);
    } else if (aggType === 'avg') {
      res = values.reduce((a, b) => a + b, 0) / values.length;
    } else if (aggType === 'max') {
      res = Math.max(...values);
    } else if (aggType === 'min') {
      res = Math.min(...values);
    }
    return Number(res.toFixed(2));
  };

  const handleAggregationChange = (colKey, newAggType) => {
    if (!onRegisterUpdate) return;
    const updatedCols = register.columns.map(c => 
      c.key === colKey ? { ...c, aggregationType: newAggType } : c
    );
    onRegisterUpdate({ ...register, columns: updatedCols });
  };

  const handleWhatsAppShare = () => {
    let text = `*${register.title}*\n\n`;
    rows.forEach((row, i) => {
      text += `${i + 1}. `;
      const rowData = register.columns.map(c => `${c.label}: ${row.cells[c.key] || '-'}`).join(', ');
      text += rowData + '\n';
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExcelExport = () => {
    let csv = `\uFEFF`; // UTF-8 BOM
    csv += register.columns.map(c => `"${c.label}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += register.columns.map(c => `"${row.cells[c.key] || ''}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${register.title}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const colStats = {};
  if (rows.length > 1) {
    register.columns.forEach(col => {
      if ((col.type === 'number' || col.type === 'formula') && col.colorScale) {
        const values = rows.map(r => Number(r.cells[col.key])).filter(v => !isNaN(v));
        if (values.length > 1) {
          const max = Math.max(...values);
          const min = Math.min(...values);
          if (max > min) {
            colStats[col.key] = { max, min };
          }
        }
      }
    });
  }

  return (
    <div className="flex flex-col h-full print-area">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm mb-2 rounded-lg mx-2 mt-2 hide-on-print">
        <h2 className="text-lg font-bold text-gray-800">{register.title}</h2>
        <div className="flex gap-2">
          <button onClick={handleWhatsAppShare} title="Send to WhatsApp" className="text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded hover:bg-green-100 font-medium text-sm transition-colors">
            <Share2 size={16} /> WhatsApp
          </button>
          <button onClick={() => window.print()} title="Save as PDF / Print" className="text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1 rounded hover:bg-red-100 font-medium text-sm transition-colors">
            <Printer size={16} /> PDF
          </button>
          <button onClick={handleExcelExport} title="Download Excel (CSV)" className="text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 font-medium text-sm transition-colors">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2">
        <div className="min-w-max border rounded-lg bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-500 border-r w-12 text-center bg-gray-100">#</th>
                {register.columns.map((col, idx) => (
                  <th 
                    key={col.key} 
                    className={`p-3 text-sm font-semibold text-gray-600 border-r whitespace-nowrap group relative ${draggedColIdx === idx ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={(e) => handleColDragStart(e, idx)}
                    onDragOver={(e) => handleColDragOver(e, idx)}
                    onDrop={(e) => handleColDrop(e, idx)}
                    onDragEnd={() => setDraggedColIdx(null)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <GripVertical size={14} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hide-on-print" />
                        <span className="text-gray-800">{col.label} {col.type === 'formula' && '✨'} {col.colorScale && '🎨'}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity hide-on-print">
                        <button 
                          onClick={() => onEditColumnClick(col)}
                          className="text-gray-400 hover:text-primary"
                          title="Edit Column"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleColumnDelete(col.key)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete Column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-3 w-12 bg-gray-50 hide-on-print"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIndex) => (
                <tr 
                  key={row._id || rIndex} 
                  className={`border-b hover:bg-blue-50 transition-colors group ${draggedRowIdx === rIndex ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, rIndex)}
                  onDragOver={(e) => handleRowDragOver(e, rIndex)}
                  onDrop={(e) => handleRowDrop(e, rIndex)}
                  onDragEnd={() => setDraggedRowIdx(null)}
                >
                  <td className="p-3 border-r text-gray-400 font-medium text-center text-sm bg-gray-50 select-none">
                    <div className="flex items-center justify-center gap-1">
                      <GripVertical size={14} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hide-on-print" />
                      <span>{rIndex + 1}</span>
                    </div>
                  </td>
                  {register.columns.map(col => {
                    let bgClass = col.type === 'formula' ? 'bg-gray-50 text-gray-500 font-medium' : 'focus:ring-2 focus:ring-primary focus:bg-white';
                    if (colStats[col.key]) {
                      const val = Number(row.cells[col.key]);
                      if (!isNaN(val) && row.cells[col.key] !== '') {
                        if (val === colStats[col.key].max) bgClass = 'bg-emerald-100 text-emerald-800 font-bold';
                        else if (val === colStats[col.key].min) bgClass = 'bg-rose-100 text-rose-800 font-bold';
                      }
                    }

                    return (
                      <td key={col.key} className="p-0 border-r">
                        <input
                          type={col.type === 'number' || col.type === 'formula' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                          value={col.type === 'formula' && row.cells[col.key] !== undefined && row.cells[col.key] !== '' ? Number(Number(row.cells[col.key]).toFixed(2)) : (row.cells[col.key] || '')}
                          onChange={(e) => handleCellChange(rIndex, col.key, e.target.value)}
                          onBlur={(e) => {
                            if (col.type === 'number' && e.target.value !== '') {
                              const val = Number(e.target.value);
                              if (!isNaN(val)) {
                                handleCellChange(rIndex, col.key, Number(val.toFixed(2)));
                              }
                            }
                          }}
                          readOnly={col.type === 'formula'}
                          className={`w-full p-3 bg-transparent outline-none transition-colors ${bgClass}`}
                          placeholder="..."
                        />
                      </td>
                    );
                  })}
                  <td className="p-3 border-l text-center bg-white opacity-0 group-hover:opacity-100 transition-opacity hide-on-print">
                    <button 
                      onClick={() => onRowDelete && onRowDelete(row._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Summary Footer */}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="p-2 border-r bg-gray-100"></td>
                {register.columns.map((col, i) => {
                  const isNumeric = col.type === 'number' || col.type === 'formula';
                  const aggVal = getAggregationResult(col.key, col.type, col.aggregationType);
                  
                  return (
                    <td key={col.key} className="p-2 border-r text-gray-800">
                      {isNumeric ? (
                        <div className="flex flex-col gap-1">
                          <select 
                            className="text-xs bg-white text-gray-500 outline-none cursor-pointer border rounded p-1 hover:border-primary transition-colors"
                            value={col.aggregationType || 'none'}
                            onChange={(e) => handleAggregationChange(col.key, e.target.value)}
                          >
                            <option value="none">Empty</option>
                            <option value="sum">Sum</option>
                            <option value="avg">Avg</option>
                            <option value="max">Max</option>
                            <option value="min">Min</option>
                          </select>
                          {col.aggregationType && col.aggregationType !== 'none' && (
                            <span className="font-bold text-sm text-primary">{aggVal}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400 text-sm font-medium">
                            {i === 0 ? 'Summary →' : ''}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="p-2 border-l bg-gray-50 hide-on-print"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SmartTable;
