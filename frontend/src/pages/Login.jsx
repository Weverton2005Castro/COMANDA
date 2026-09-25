import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import TicketCard from '../components/TicketCard.jsx';
import StampButton from '../components/StampButton.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [clock, setClock] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

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
      <TicketCard 
        number="0842" 
        timestamp={clock} 
        tilted={true}
        className="login-card"
      >
        <h1>Comanda</h1>
        <p className="tagline">acesso do sistema · unidades cadastradas</p>
        
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">email</label>
            <input 
              id="email"
              name="email" 
              type="text" 
              placeholder="usuario@usuario.com" 
              value={form.email} 
              onChange={updateField} 
              required 
            />
          </div>
          
          <div className="field">
            <label htmlFor="senha">senha</label>
            <input 
              id="senha"
              name="senha" 
              type="password" 
              placeholder="••••••••" 
              value={form.senha} 
              onChange={updateField} 
              required 
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <StampButton 
            type="submit" 
            disabled={loading}
            stamped={loading}
          >
            {loading ? (
              <span>✓ comanda aberta</span>
            ) : (
              <span>entrar</span>
            )}
          </StampButton>
        </form>

        <p className="foot">impresso pelo sistema de comandas</p>
      </TicketCard>
    </main>
  );
}
