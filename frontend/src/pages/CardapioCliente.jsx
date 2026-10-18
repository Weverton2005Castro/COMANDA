import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

const categorias = [
  { id: 'todos', label: 'tudo' },
  { id: 'prato', label: 'pratos' },
  { id: 'bebida', label: 'bebidas' },
  { id: 'extra', label: 'extras' }
];

const moeda = (valor) => Number(valor).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export default function CardapioCliente() {
  const { restauranteId } = useParams();
  const [restaurante, setRestaurante] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState('todos');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    api.get(`/produtos/publico/${encodeURIComponent(restauranteId)}`)
      .then(({ data }) => {
        if (!ativo) return;
        setRestaurante(data.restaurante);
        setProdutos(data.produtos);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(error.response?.status === 404
          ? 'Não encontramos este restaurante.'
          : 'Não foi possível carregar o cardápio. Tente novamente em instantes.');
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => { ativo = false; };
  }, [restauranteId]);

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return produtos.filter((produto) => {
      const correspondeCategoria = categoria === 'todos' || produto.categoria === categoria;
      const correspondeBusca = !termo || `${produto.nome} ${produto.descricao || ''}`
        .toLocaleLowerCase('pt-BR').includes(termo);
      return correspondeCategoria && correspondeBusca;
    });
  }, [busca, categoria, produtos]);

  return (
    <main className="menu-page">
      <header className="menu-header">
        <div className="menu-brand-mark" aria-hidden="true">✳</div>
        <div>
          <span className="menu-eyebrow">cardápio da casa</span>
          <h1>{restaurante?.nome || 'Cardápio'}</h1>
          <p>Feito com carinho, servido quentinho.</p>
        </div>
        <span className="menu-open-label"><i /> aberto para você</span>
      </header>

      <section className="menu-content" aria-label="Cardápio">
        <div className="menu-intro">
          <div>
            <span className="menu-eyebrow">escolha com calma</span>
            <h2>O que vai ser hoje?</h2>
          </div>
          <label className="menu-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="buscar no cardápio"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              aria-label="Buscar no cardápio"
            />
          </label>
        </div>

        <nav className="tabs menu-tabs" aria-label="Categorias">
          {categorias.map((item) => (
            <button
              className={categoria === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => setCategoria(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <span className="menu-item-count">{produtosVisiveis.length} {produtosVisiveis.length === 1 ? 'item' : 'itens'}</span>
        </nav>

        {loading ? (
          <div className="menu-message">preparando o cardápio…</div>
        ) : erro ? (
          <div className="menu-message menu-error">{erro}</div>
        ) : produtosVisiveis.length ? (
          <div className="menu-product-grid">
            {produtosVisiveis.map((produto, index) => (
              <article className="menu-product-card" key={produto.id}>
                <div className="menu-product-topline">
                  <span className="menu-product-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="menu-category-label">
                    {categorias.find((item) => item.id === produto.categoria)?.label || produto.categoria}
                  </span>
                </div>
                <h3>{produto.nome}</h3>
                <p>{produto.descricao || 'Uma delícia preparada especialmente para você.'}</p>
                <div className="menu-product-price"><span>R$</span> {moeda(produto.preco).replace('R$', '').trim()}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="menu-message">Nenhum item encontrado. Experimente outra busca ou categoria.</div>
        )}
      </section>

      <footer className="menu-footer">
        <span>feito na casa <b>✳</b></span>
        <span>cardápio sujeito à disponibilidade</span>
      </footer>
    </main>
  );
}
