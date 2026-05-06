import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form.email, form.senha);
      navigate('/dashboard');
    } catch {
      setError('Email ou senha invalidos.');
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Sistema de Comandas</h1>
        <label>
          Email
          <input name="email" type="text" value={form.email} onChange={updateField} required />
        </label>
        <label>
          Senha
          <input name="senha" type="password" value={form.senha} onChange={updateField} required />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button className="btn primary full" disabled={loading} type="submit">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="login-help">
          <strong>Acessos de teste</strong>
          <span>Admin: admin@restaurante.com</span>
          <span>Garcom: joao@restaurante.com</span>
          <span>Gestor: maria@restaurante.com</span>
          <span>Senha: password</span>
        </div>
      </form>
    </main>
  );
}
