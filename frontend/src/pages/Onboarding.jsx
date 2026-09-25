import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import TicketCard from '../components/TicketCard.jsx';
import StampButton from '../components/StampButton.jsx';

const emptyProduct = { nome: '', preco: '', categoria: 'prato', descricao: '' };

export default function Onboarding() {
  const { user, onboarding, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(user ? 2 : 1);
  const [account, setAccount] = useState({ restaurante: '', nome: '', email: '', senha: '' });
  const [tableNumbers, setTableNumbers] = useState('');
  const [product, setProduct] = useState(emptyProduct);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(setter) {
    return (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function createAccount(event) {
    event.preventDefault();
    setError('');
    try {
      await onboarding(account);
      setStep(2);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'não foi possível criar sua conta.');
    }
  }

  async function saveTables() {
    const numbers = [...new Set(tableNumbers.split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0))];
    setSaving(true);
    setError('');
    try {
      await Promise.all(numbers.map((numero) => api.post('/mesas', { numero })));
      setStep(3);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'não foi possível cadastrar as mesas.');
    } finally {
      setSaving(false);
    }
  }

  async function addProduct(event) {
    event.preventDefault();
    const payload = { ...product, preco: Number(product.preco), disponivel: true };
    try {
      await api.post('/produtos', payload);
      setProducts((current) => [...current, payload]);
      setProduct(emptyProduct);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'não foi possível cadastrar o item.');
    }
  }

  async function finish() {
    setSaving(true);
    try {
      await api.post('/auth/onboarding/complete');
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="login-page">
      <TicketCard 
        number="NOVO" 
        tilted={true}
        className="login-card onboarding-card"
      >
        <div><h1>comece seu restaurante</h1><p className="tagline">etapa {step} de 3</p></div>
        {step === 1 && <form onSubmit={createAccount} className="form-stack">
          <div className="field">
            <label>nome do restaurante</label>
            <input name="restaurante" placeholder="nome do restaurante" value={account.restaurante} onChange={update(setAccount)} required />
          </div>
          <div className="field">
            <label>seu nome</label>
            <input name="nome" placeholder="seu nome" value={account.nome} onChange={update(setAccount)} required />
          </div>
          <div className="field">
            <label>seu email</label>
            <input name="email" type="email" placeholder="seu email" value={account.email} onChange={update(setAccount)} required />
          </div>
          <div className="field">
            <label>senha</label>
            <input name="senha" type="password" minLength="8" placeholder="crie uma senha (mínimo 8 caracteres)" value={account.senha} onChange={update(setAccount)} required />
          </div>
          <StampButton disabled={loading} stamped={loading}>criar conta e restaurante</StampButton>
        </form>}
        {step === 2 && <div className="form-stack">
          <p>cadastre as mesas separadas por vírgula. ex.: 1, 2, 3, 10.</p>
          <input value={tableNumbers} onChange={(event) => setTableNumbers(event.target.value)} placeholder="1, 2, 3" />
          <StampButton onClick={saveTables} disabled={saving} stamped={saving}>salvar mesas e continuar</StampButton>
          <button className="btn secondary full" onClick={() => setStep(3)} type="button">pular por enquanto</button>
        </div>}
        {step === 3 && <div className="form-stack">
          <p>adicione os primeiros itens do cardápio. você poderá editar tudo depois.</p>
          <form onSubmit={addProduct} className="form-stack">
            <div className="field">
              <label>nome do item</label>
              <input name="nome" placeholder="nome do item" value={product.nome} onChange={update(setProduct)} required />
            </div>
            <div className="field">
              <label>preço</label>
              <input name="preco" type="number" min="0" step="0.01" placeholder="preço" value={product.preco} onChange={update(setProduct)} required />
            </div>
            <div className="field select-wrap">
              <label>categoria</label>
              <select name="categoria" value={product.categoria} onChange={update(setProduct)}><option value="prato">prato</option><option value="bebida">bebida</option><option value="extra">extra</option></select>
            </div>
            <div className="field">
              <label>descrição (opcional)</label>
              <input name="descricao" placeholder="descrição (opcional)" value={product.descricao} onChange={update(setProduct)} />
            </div>
            <button className="btn secondary full" type="submit">adicionar item</button>
          </form>
          {products.length > 0 && <span>{products.length} item(ns) adicionado(s).</span>}
          <StampButton onClick={finish} disabled={saving} stamped={saving}>concluir e abrir painel</StampButton>
        </div>}
        {error && <div className="error-message">{error}</div>}
        <p className="foot">configuração inicial do sistema</p>
      </TicketCard>
    </main>
  );
}
