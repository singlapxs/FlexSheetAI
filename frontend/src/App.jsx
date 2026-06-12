import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import RegisterView from './views/RegisterView';
import TableView from './views/TableView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { flushSyncQueue } from './services/api';
import { Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connected. Synchronizing offline queue...');
      flushSyncQueue();
    };

    window.addEventListener('online', handleOnline);
    if (navigator.onLine) {
      flushSyncQueue();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <GoogleOAuthProvider clientId="1004035279299-1ia2pi81vuh7u3unpqbshhs9caotpo0c.apps.googleusercontent.com">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="workspace/:workspaceId" element={<RegisterView />} />
              <Route path="table/:registerId" element={<TableView />} />
              <Route path="settings" element={<div className="p-4">Settings</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
