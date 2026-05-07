import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import GarcomDashboard from './pages/GarcomDashboard.jsx';
import GestorDashboard from './pages/GestorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import Cardapio from './components/Cardapio.jsx';

function DashboardRouter() {
  const { user } = useAuth();

  if (user?.tipo === 'garcom') return <GarcomDashboard />;
  if (user?.tipo === 'gestor') return <GestorDashboard />;
  if (user?.tipo === 'admin') return <AdminDashboard />;
  return <Navigate to="/login" replace />;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader">Carregando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/cardapio" element={<Cardapio/>} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardRouter />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
