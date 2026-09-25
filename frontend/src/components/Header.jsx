import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        <span>bem-vindo(a), {user?.nome}</span>
      </div>
      <button className="btn secondary small" onClick={logout} type="button">
        sair
      </button>
    </header>
  );
}
