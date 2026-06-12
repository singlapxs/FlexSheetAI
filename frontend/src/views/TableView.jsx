import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SmartTable from '../components/SmartTable';
import { getRegisters, getRows, updateRow, createRow, updateRegister, deleteRow, reorderRowsAPI } from '../services/api';

const TableView = () => {
  const { registerId } = useParams();
  const [register, setRegister] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColData, setNewColData] = useState({ label: '', type: 'text', formulaExpression: '' });
  
  // Edit Column State
  const [editColData, setEditColData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resReg = await fetch(`http://localhost:5000/api/registers/${registerId}`);
        const regData = await resReg.json();
        const rowData = await getRows(registerId);
        
        setRegister(regData);
        setRows(rowData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [registerId]);

  const handleRowUpdate = async (updatedRow) => {
    try {
      if (updatedRow._id) {
        await updateRow(registerId, updatedRow._id, updatedRow.cells);
      }
    } catch (err) {
      console.error('Failed to save row', err);
    }
  };

  // --- ADD ROW LOGIC ---
  const handleAddRowSubmit = async (e) => {
    e.preventDefault();
    try {
      const newRow = await createRow(registerId, newRowData);
      setRows([...rows, newRow]);
      setIsRowModalOpen(false);
      setNewRowData({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleRowDelete = async (rowId) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    try {
      await deleteRow(registerId, rowId);
      setRows(rows.filter(r => r._id !== rowId));
    } catch (err) {
      console.error('Failed to delete row', err);
    }
  };

  const handleRowReorder = async (reorderedRows) => {
    // Optimistically update local state
    setRows(reorderedRows);

    // Prepare orders payload: [{ id, order }]
    const orders = reorderedRows.map((row, index) => ({ id: row._id, order: index }));
    try {
      await reorderRowsAPI(registerId, orders);
    } catch (err) {
      console.error('Failed to save reordered rows', err);
    }
  };

  // --- ADD COLUMN LOGIC ---
  const handleAddColumnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newColData.label) return;
      
      const key = newColData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newCol = {
        key,
        label: newColData.label,
        type: newColData.type,
        formulaExpression: newColData.type === 'formula' ? newColData.formulaExpression : undefined,
        colorScale: newColData.colorScale || false
      };

      const updatedReg = { ...register, columns: [...register.columns, newCol] };
      const savedReg = await updateRegister(registerId, updatedReg);
      
      setRegister(savedReg);
      setIsColModalOpen(false);
      setNewColData({ label: '', type: 'text', formulaExpression: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // --- EDIT COLUMN LOGIC ---
  const handleEditColumnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editColData.label) return;
      
      const updatedCols = register.columns.map(c => {
        if (c.key === editColData.key) {
          return {
            ...c,
            label: editColData.label,
            type: editColData.type,
            formulaExpression: editColData.type === 'formula' ? editColData.formulaExpression : undefined,
            colorScale: editColData.colorScale || false
          };
        }
        return c;
      });

      const updatedReg = { ...register, columns: updatedCols };
      const savedReg = await updateRegister(registerId, updatedReg);
      
      setRegister(savedReg);
      setEditColData(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterUpdate = async (updatedRegister) => {
    try {
      const savedReg = await updateRegister(registerId, updatedRegister);
      setRegister(savedReg);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Loading table...</div>;
  if (!register) return <div className="p-4 text-red-500">Error loading table metadata</div>;

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-2 flex justify-between items-center bg-white border-b shadow-sm">
        <Link to={`/workspace/${register.workspaceId}`} className="text-primary text-sm font-medium">&larr; Back to Workspace</Link>
        <button onClick={() => setIsColModalOpen(true)} className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-700 hover:bg-gray-200">
          + Add Column
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <SmartTable 
          register={register} 
          rows={rows} 
          onRowUpdate={handleRowUpdate} 
          onRegisterUpdate={handleRegisterUpdate}
          onEditColumnClick={(col) => setEditColData({ ...col })}
          onRowDelete={handleRowDelete}
          onRowReorder={handleRowReorder}
        />
      </div>

      <div className="p-4 bg-white border-t">
        <button onClick={() => setIsRowModalOpen(true)} className="w-full bg-secondary text-white py-3 rounded-lg font-semibold shadow hover:bg-emerald-600 transition">
          + Fill New Row
        </button>
      </div>

      {/* ROW MODAL */}
      {isRowModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Entry</h3>
            <form onSubmit={handleAddRowSubmit} className="space-y-4">
              {register.columns.map(col => {
                if (col.type === 'formula') return null; // Can't input formulas directly
                return (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{col.label}</label>
                    <input
                      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                      value={newRowData[col.key] || ''}
                      onChange={(e) => setNewRowData({...newRowData, [col.key]: e.target.value})}
                    />
                  </div>
                );
              })}
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setIsRowModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">Save Row</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLUMN MODAL */}
      {isColModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Column</h3>
            <form onSubmit={handleAddColumnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                  value={newColData.label}
                  onChange={(e) => setNewColData({...newColData, label: e.target.value})}
                  placeholder="e.g. Discount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                  value={newColData.type}
                  onChange={(e) => setNewColData({...newColData, type: e.target.value})}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="formula">Formula</option>
                </select>
              </div>
              
              {newColData.type === 'formula' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula Expression</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none font-mono text-sm mb-2"
                    value={newColData.formulaExpression}
                    onChange={(e) => setNewColData({...newColData, formulaExpression: e.target.value})}
                    placeholder="e.g. {qty} * {price}"
                    required={newColData.type === 'formula'}
                  />
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Insert Column Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {register.columns.map(c => (
                        <button 
                          key={c.key} 
                          type="button" 
                          onClick={() => setNewColData({...newColData, formulaExpression: (newColData.formulaExpression || '') + `{${c.key}}`})}
                          className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Operators:</p>
                    <div className="flex flex-wrap gap-1">
                      {['+', '-', '*', '/', '(', ')'].map(op => (
                        <button 
                          key={op} 
                          type="button" 
                          onClick={() => setNewColData({...newColData, formulaExpression: (newColData.formulaExpression || '') + ` ${op} `})}
                          className="bg-gray-100 border text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-200 font-mono"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(newColData.type === 'number' || newColData.type === 'formula') && (
                <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded border">
                  <input 
                    type="checkbox" 
                    id="colorScaleNew" 
                    checked={newColData.colorScale || false}
                    onChange={(e) => setNewColData({...newColData, colorScale: e.target.checked})}
                  />
                  <label htmlFor="colorScaleNew" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🎨 Auto-highlight Max (Green) / Min (Red)
                  </label>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setIsColModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">Add Column</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COLUMN MODAL */}
      {editColData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Edit Column</h3>
            <form onSubmit={handleEditColumnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                  value={editColData.label}
                  onChange={(e) => setEditColData({...editColData, label: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                  value={editColData.type}
                  onChange={(e) => setEditColData({...editColData, type: e.target.value})}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="formula">Formula</option>
                </select>
              </div>
              
              {editColData.type === 'formula' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula Expression</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none font-mono text-sm mb-2"
                    value={editColData.formulaExpression || ''}
                    onChange={(e) => setEditColData({...editColData, formulaExpression: e.target.value})}
                    placeholder="e.g. {qty} * {price}"
                    required={editColData.type === 'formula'}
                  />
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Insert Column Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {register.columns.map(c => {
                        if (c.key === editColData.key) return null; // prevent self-reference
                        return (
                          <button 
                            key={c.key} 
                            type="button" 
                            onClick={() => setEditColData({...editColData, formulaExpression: (editColData.formulaExpression || '') + `{${c.key}}`})}
                            className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            {c.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Operators:</p>
                    <div className="flex flex-wrap gap-1">
                      {['+', '-', '*', '/', '(', ')'].map(op => (
                        <button 
                          key={op} 
                          type="button" 
                          onClick={() => setEditColData({...editColData, formulaExpression: (editColData.formulaExpression || '') + ` ${op} `})}
                          className="bg-gray-100 border text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-200 font-mono"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(editColData.type === 'number' || editColData.type === 'formula') && (
                <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded border">
                  <input 
                    type="checkbox" 
                    id="colorScaleEdit" 
                    checked={editColData.colorScale || false}
                    onChange={(e) => setEditColData({...editColData, colorScale: e.target.checked})}
                  />
                  <label htmlFor="colorScaleEdit" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🎨 Auto-highlight Max (Green) / Min (Red)
                  </label>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setEditColData(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">Save Column</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
