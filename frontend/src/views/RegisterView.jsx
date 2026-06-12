import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRegisters, createRegister } from '../services/api';

const RegisterView = () => {
  const { workspaceId } = useParams();
  const [registers, setRegisters] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    getRegisters(workspaceId).then(setRegisters).catch(console.error);
  }, [workspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    
    // Quick Default Template for demonstration
    const defaultColumns = [
      { key: 'item', label: 'Item Name', type: 'text' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'total', label: 'Total', type: 'formula', formulaExpression: '{qty} * {price}' }
    ];

    try {
      const reg = await createRegister(workspaceId, { title, columns: defaultColumns });
      setRegisters([...registers, reg]);
      setTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <Link to="/" className="text-primary text-sm mb-4 inline-block">&larr; Back to Workspaces</Link>
      <h2 className="text-2xl font-bold mb-4">Workspace Registers</h2>
      
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New Table Name..." 
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Create Table</button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {registers.map(reg => (
          <Link key={reg._id} to={`/table/${reg._id}`} className="p-4 bg-white shadow rounded flex justify-between items-center hover:shadow-md transition">
            <span className="font-semibold">{reg.title}</span>
            <span className="text-xs text-gray-500">{reg.columns.length} Columns</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RegisterView;
