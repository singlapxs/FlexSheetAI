import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkspaces, createWorkspace } from '../services/api';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWsName, setNewWsName] = useState('');

  useEffect(() => {
    // Fetch spaces - will fail if auth is strictly enforced without a token
    // For this prototype, ensure backend auth middleware is either mocked or passed a token.
    getWorkspaces().then(setWorkspaces).catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWsName) return;
    try {
      const ws = await createWorkspace(newWsName);
      setWorkspaces([...workspaces, ws]);
      setNewWsName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Workspaces</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newWsName}
          onChange={(e) => setNewWsName(e.target.value)}
          placeholder="New Workspace Name..." 
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Create</button>
      </form>

      <div className="grid grid-cols-2 gap-4">
        {workspaces.map(ws => (
          <Link key={ws._id} to={`/workspace/${ws._id}`} className="p-4 bg-white shadow rounded hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{ws.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
