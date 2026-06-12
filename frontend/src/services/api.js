import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// For development, we will mock a token or bypass auth by assuming the backend allows it.
// In a real app, you would attach the JWT from local storage here.
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Failed to parse user from local storage');
    }
  }
  return config;
});

export const getWorkspaces = () => api.get('/workspaces').then(res => res.data);
export const createWorkspace = (name) => api.post('/workspaces', { name }).then(res => res.data);

export const getRegisters = (workspaceId) => api.get(`/workspaces/${workspaceId}/registers`).then(res => res.data);
export const createRegister = (workspaceId, data) => api.post(`/workspaces/${workspaceId}/registers`, data).then(res => res.data);
export const updateRegister = (registerId, data) => api.put(`/registers/${registerId}`, data).then(res => res.data);

export const saveToQueue = (action, endpoint, payload, tempId) => {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  queue.push({ action, endpoint, payload, tempId, timestamp: Date.now() });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

export const flushSyncQueue = async () => {
  const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  if (queue.length === 0) return;
  
  console.log(`Flushing ${queue.length} offline actions...`);
  
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      if (item.action === 'post') {
        await api.post(item.endpoint, item.payload);
      } else if (item.action === 'put') {
        await api.put(item.endpoint, item.payload);
      }
    } catch (err) {
      console.error('Failed to sync item, will retry later:', err);
      localStorage.setItem('offlineQueue', JSON.stringify(queue.slice(i)));
      return; 
    }
  }
  
  localStorage.removeItem('offlineQueue');
};

export const getRows = (registerId) => api.get(`/registers/${registerId}/rows`).then(res => res.data);

export const createRow = async (registerId, cells) => {
  try {
    const res = await api.post(`/registers/${registerId}/rows`, { cells });
    return res.data;
  } catch (err) {
    if (!navigator.onLine || err.message === 'Network Error') {
      const tempId = 'temp_' + Date.now();
      saveToQueue('post', `/registers/${registerId}/rows`, { cells }, tempId);
      return { _id: tempId, cells, registerId };
    }
    throw err;
  }
};

export const updateRow = async (registerId, rowId, cells) => {
  try {
    const res = await api.put(`/registers/${registerId}/rows/${rowId}`, { cells });
    return res.data;
  } catch (err) {
    if (!navigator.onLine || err.message === 'Network Error') {
      if (String(rowId).startsWith('temp_')) {
         const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
         const pendingPost = queue.find(q => q.tempId === rowId && q.action === 'post');
         if (pendingPost) {
           pendingPost.payload.cells = cells;
           localStorage.setItem('offlineQueue', JSON.stringify(queue));
           return { _id: rowId, cells, registerId };
         }
      }
      saveToQueue('put', `/registers/${registerId}/rows/${rowId}`, { cells }, rowId);
      return { _id: rowId, cells, registerId };
    }
    throw err;
  }
};
export const deleteRow = (registerId, rowId) => api.delete(`/registers/${registerId}/rows/${rowId}`).then(res => res.data);
export const reorderRowsAPI = (registerId, orders) => api.put(`/registers/${registerId}/rows/reorder`, { orders }).then(res => res.data);
