import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import api from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

const tabs = [
  { id: 'prato', label: 'Pratos' },
  { id: 'bebida', label: 'Bebidas' },
  { id: 'extra', label: 'Extras' }
];

export default function Cardapio({ onComandaChange }) {
  const [produtos, setProdutos] = useState([]);
  const [activeTab, setActiveTab] = useState('prato');
  const [selection, setSelection] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [comanda, setComanda] = useState(null);

  const location = useLocation();
  const mesa = location.state?.mesa;

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProdutos();
  }, []);

  useEffect(() => {
    loadComandaAtiva();
  }, [mesa]);

  async function loadProdutos() {
    try {
      const { data } = await api.get('/produtos');

      setProdutos(
        data.filter((produto) => produto.disponivel)
      );
    } catch {
      showToast('Erro ao carregar produtos.', 'error');
    }
  }

  async function loadComandaAtiva() {
    if (!mesa?.id) return;

    try {
      const { data } = await api.get(
        `/comandas/mesa/${mesa.id}/ativa`
      );

      if (data) {
        setComanda(data);

        setSelection(
          data.itens.map((item) => ({
            id: item.id,
            produto: item.produto,
            quantidade: item.quantidade
          }))
        );
      }
    } catch (error) {
      console.log(error.response?.data)
    }
  }

  const visibleProducts = produtos.filter(
    (produto) => produto.categoria === activeTab
  );

  const total = useMemo(
    () =>
      selection.reduce(
        (sum, item) =>
          sum +
          Number(item.produto.preco) * item.quantidade,
        0
      ),
    [selection]
  );

  function addProduct(produto) {
    setSelection((current) => {
      const found = current.find(
        (item) => item.produto.id === produto.id
      );

      if (found) {
        return current.map((item) =>
          item.produto.id === produto.id
            ? {
              ...item,
              quantidade: item.quantidade + 1
            }
            : item
        );
      }

      return [...current, { produto, quantidade: 1 }];
    });
  }

  function changeQuantity(produtoId, delta) {
    setSelection((current) =>
      current
        .map((item) =>
          item.produto.id === produtoId
            ? {
              ...item,
              quantidade: item.quantidade + delta
            }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  async function submitItems() {
    if (!selection.length) {
      showToast(
        'Selecione ao menos um produto.',
        'warning'
      );

      return;
    }

    if (!mesa?.id) {
      showToast('Mesa não encontrada.', 'error');
      return;
    }

    const itens = selection.map((item) => ({
      produto_id: item.produto.id,
      quantidade: item.quantidade
    }));

    try {
      let response;

      if (comanda) {
        response = await api.post(
          `/comandas/${comanda.id}/itens`,
          { itens }
        );
      } else {
        response = await api.post('/comandas', {
          mesa_id: mesa.id,
          itens
        });
      }

      const data = response.data;

      setComanda(data);

      onComandaChange?.(data);

      showToast(
        'Itens enviados com sucesso.',
        'success'
      );
    } catch (error) {
      console.error('ERRO COMPLETO:', error);
      console.error('RESPONSE:', error.response);
      console.error('DATA:', error.response?.data);

      showToast(
        error.response?.data?.message ||
        'Erro ao enviar itens.',
        'error'
      );
    }
  }

  async function removeItem(item) {

    try {

      // SE O ITEM JA EXISTE NO BANCO
      if (item.id && comanda?.id) {

        await api.delete(
          `/comandas/${comanda.id}/itens/${item.id}`
        );
      }

      // REMOVE DA TELA
      setSelection((list) =>
        list.filter((entry) =>
          entry.produto.id !== item.produto.id
        )
      );

      showToast(
        'Item removido.',
        'success'
      );

    } catch (error) {

      console.error(error);

      showToast(
        'Erro ao remover item.',
        'error'
      );
    }
  }

  async function pagarComanda() {

    if (!comanda?.id) return;

    try {

      await api.post(
        `/comandas/${comanda.id}/pagar`
      );

      showToast(
        'Pagamento finalizado.',
        'success'
      );

      setComanda(null);
      setSelection([]);

    } catch (error) {

      console.error(error);

      showToast(
        'Erro ao finalizar pagamento.',
        'error'
      );
    }
  }

  function handleVoltar() {
    navigate('/dashboard');
  }

  return (
    <section
      className="card"
      style={{ paddingBottom: '120px' }}
    >
      <div className="section-title">
        <h2>
          Cardápio
          {mesa && ` - Mesa ${mesa.numero}`}
        </h2>

        <strong>
          {total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </strong>
      </div>

      <div
        style={{ display: 'flex' }}
        className="tabs"
      >
        {tabs.map((tab) => (
          <button
            className={
              activeTab === tab.id ? 'active' : ''
            }
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}

        <button
          style={{
            background: '#808080',
            color: 'white',
            marginLeft: 'auto'
          }}
          onClick={handleVoltar}
          type="button"
        >
          Voltar
        </button>
      </div>

      <div className="product-grid">
        {visibleProducts.map((produto) => (
          <button
            className="product-card"
            key={produto.id}
            onClick={() => addProduct(produto)}
            type="button"
          >
            <strong>{produto.nome}</strong>

            <span>{produto.descricao}</span>

            <b>
              {Number(produto.preco).toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL'
                }
              )}
            </b>
          </button>
        ))}
      </div>

      {selection.length > 0 && (
        <div
          className="selection-box"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: 999,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            background: '#fff',
            padding: '15px',
            boxShadow:
              '0 -2px 10px rgba(0,0,0,0.2)'
          }}
        >
          <div
            onClick={() =>
              setCartOpen(!cartOpen)
            }
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <h3 style={{ margin: 0 }}>
              Carrinho ({selection.length})
            </h3>

            <strong>
              {total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </strong>
          </div>

          {cartOpen && (
            <>
              <div style={{ marginTop: '15px' }}>
                {selection.map((item) => (
                  <div
                    className="selection-row"
                    key={item.produto.id}
                  >
                    <span>
                      {item.produto.nome}
                    </span>

                    <div className="quantity-controls">
                      <button
                        className="btn secondary small"
                        onClick={() =>
                          changeQuantity(
                            item.produto.id,
                            -1
                          )
                        }
                        type="button"
                      >
                        -
                      </button>

                      <strong>
                        {item.quantidade}
                      </strong>

                      <button
                        className="btn primary small"
                        onClick={() =>
                          changeQuantity(
                            item.produto.id,
                            1
                          )
                        }
                        type="button"
                      >
                        +
                      </button>

                      <button
                        className="btn danger small"
                        onClick={() => removeItem(item)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn success full"
                onClick={submitItems}
                type="button"
                style={{ marginTop: '15px' }}
              >
                Enviar para Comanda
              </button>
              
              {comanda?.status === 'pronto' && (
                <button
                  className="btn warning full"
                  onClick={pagarComanda}
                  type="button"
                  style={{ marginTop: '10px' }}
                >
                  Cliente já pagou
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}