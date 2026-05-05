import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

const tabs = [
  { id: 'prato', label: 'Pratos' },
  { id: 'bebida', label: 'Bebidas' },
  { id: 'extra', label: 'Extras' }
];

export default function Cardapio({ mesa, comanda, onComandaChange }) {
  const [produtos, setProdutos] = useState([]);
  const [activeTab, setActiveTab] = useState('prato');
  const [selection, setSelection] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/produtos').then(({ data }) => setProdutos(data.filter((produto) => produto.disponivel)));
  }, []);

  const visibleProducts = produtos.filter((produto) => produto.categoria === activeTab);
  const total = useMemo(
    () => selection.reduce((sum, item) => sum + Number(item.produto.preco) * item.quantidade, 0),
    [selection]
  );

  function addProduct(produto) {
    setSelection((current) => {
      const found = current.find((item) => item.produto.id === produto.id);
      if (found) {
        return current.map((item) => (item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item));
      }
      return [...current, { produto, quantidade: 1 }];
    });
  }

  function changeQuantity(produtoId, delta) {
    setSelection((current) =>
      current
        .map((item) => (item.produto.id === produtoId ? { ...item, quantidade: item.quantidade + delta } : item))
        .filter((item) => item.quantidade > 0)
    );
  }

  async function submitItems() {
    if (!selection.length) {
      showToast('Selecione ao menos um produto.', 'warning');
      return;
    }

    const itens = selection.map((item) => ({ produto_id: item.produto.id, quantidade: item.quantidade }));

    try {
      const { data } = comanda
        ? await api.post(`/comandas/${comanda.id}/itens`, { itens })
        : await api.post('/comandas', { mesa_id: mesa.id, itens });

      setSelection([]);
      onComandaChange(data);
      showToast('Itens enviados com sucesso.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Erro ao enviar itens.', 'error');
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Cardapio</h2>
        <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      </div>
      <div className="tabs">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">
            {tab.label}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {visibleProducts.map((produto) => (
          <button className="product-card" key={produto.id} onClick={() => addProduct(produto)} type="button">
            <strong>{produto.nome}</strong>
            <span>{produto.descricao}</span>
            <b>{Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
          </button>
        ))}
      </div>
      {selection.length > 0 && (
        <div className="selection-box">
          <h3>Selecao Atual</h3>
          {selection.map((item) => (
            <div className="selection-row" key={item.produto.id}>
              <span>{item.produto.nome}</span>
              <div className="quantity-controls">
                <button className="btn secondary small" onClick={() => changeQuantity(item.produto.id, -1)} type="button">-</button>
                <strong>{item.quantidade}</strong>
                <button className="btn primary small" onClick={() => changeQuantity(item.produto.id, 1)} type="button">+</button>
                <button className="btn danger small" onClick={() => setSelection((list) => list.filter((entry) => entry.produto.id !== item.produto.id))} type="button">
                  Remover
                </button>
              </div>
            </div>
          ))}
          <button className="btn success full" onClick={submitItems} type="button">
            Enviar para Comanda
          </button>
        </div>
      )}
    </section>
  );
}
