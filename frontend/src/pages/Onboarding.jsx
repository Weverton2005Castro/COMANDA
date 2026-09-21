import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

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
      setError(requestError.response?.data?.message || 'Não foi possível criar sua conta.');
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
      setError(requestError.response?.data?.message || 'Não foi possível cadastrar as mesas.');
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
      setError(requestError.response?.data?.message || 'Não foi possível cadastrar o item.');
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
      <section className="login-card onboarding-card">
        <div><h1>Comece seu restaurante</h1><p className="login-help">Etapa {step} de 3</p></div>
        {step === 1 && <form onSubmit={createAccount} className="form-stack">
          <input name="restaurante" placeholder="Nome do restaurante" value={account.restaurante} onChange={update(setAccount)} required />
          <input name="nome" placeholder="Seu nome" value={account.nome} onChange={update(setAccount)} required />
          <input name="email" type="email" placeholder="Seu email" value={account.email} onChange={update(setAccount)} required />
          <input name="senha" type="password" minLength="8" placeholder="Crie uma senha (mínimo 8 caracteres)" value={account.senha} onChange={update(setAccount)} required />
          <button className="btn primary full" disabled={loading}>Criar conta e restaurante</button>
        </form>}
        {step === 2 && <div className="form-stack">
          <p>Cadastre as mesas separadas por vírgula. Ex.: 1, 2, 3, 10.</p>
          <input value={tableNumbers} onChange={(event) => setTableNumbers(event.target.value)} placeholder="1, 2, 3" />
          <button className="btn primary full" onClick={saveTables} disabled={saving}>Salvar mesas e continuar</button>
          <button className="btn secondary full" onClick={() => setStep(3)} type="button">Pular por enquanto</button>
        </div>}
        {step === 3 && <div className="form-stack">
          <p>Adicione os primeiros itens do cardápio. Você poderá editar tudo depois.</p>
          <form onSubmit={addProduct} className="form-stack">
            <input name="nome" placeholder="Nome do item" value={product.nome} onChange={update(setProduct)} required />
            <input name="preco" type="number" min="0" step="0.01" placeholder="Preço" value={product.preco} onChange={update(setProduct)} required />
            <select name="categoria" value={product.categoria} onChange={update(setProduct)}><option value="prato">Prato</option><option value="bebida">Bebida</option><option value="extra">Extra</option></select>
            <input name="descricao" placeholder="Descrição (opcional)" value={product.descricao} onChange={update(setProduct)} />
            <button className="btn secondary full" type="submit">Adicionar item</button>
          </form>
          {products.length > 0 && <span>{products.length} item(ns) adicionado(s).</span>}
          <button className="btn primary full" onClick={finish} disabled={saving}>Concluir e abrir painel</button>
        </div>}
        {error && <div className="error-message">{error}</div>}
      </section>
    </main>
  );
}
