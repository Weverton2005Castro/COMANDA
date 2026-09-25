import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import StatusBadge from './StatusBadge.jsx';

const groups = [
  { status: 'pendente', title: 'pendentes' },
  { status: 'em_preparo', title: 'em preparo' },
  { status: 'pronto', title: 'prontos' },
  { status: 'pago', title: 'pagos' }
];

export default function ComandasList() {
  const [comandas, setComandas] = useState([]);
  const { socket } = useSocket();
  const { showToast } = useToast();

  async function loadComandas() {
    const { data } = await api.get('/comandas');
    setComandas(data);
  }

  useEffect(() => {
    loadComandas();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => loadComandas();
    socket.on('comanda_criada', refresh);
    socket.on('comanda_atualizada', refresh);
    socket.on('comanda_status_atualizado', refresh);
    socket.on('comanda_paga', refresh);
    return () => {
      socket.off('comanda_criada', refresh);
      socket.off('comanda_atualizada', refresh);
      socket.off('comanda_status_atualizado', refresh);
      socket.off('comanda_paga', refresh);
    };
  }, [socket]);

  const grouped = useMemo(
    () => groups.map((group) => ({ ...group, items: comandas.filter((comanda) => comanda.status === group.status) })),
    [comandas]
  );

  async function setStatus(comanda, status,) {
    try {
      await api.put(`/comandas/${comanda.id}/status`, { status });
      showToast('status atualizado.', 'success');
      loadComandas();
    } catch {
      showToast('não foi possível atualizar o status.', 'error');
    }
  }

  return (
    <div className="status-grid">
      {grouped.map((group) => (
        <section className="card" key={group.status}>
          <h2>{group.title}</h2>
          <div className="comanda-column">
            {group.items.map((comanda) => (
              <article className="mini-card" key={comanda.id}>
                <div className="section-title">
                  <strong>{comanda.numero_comanda || `#${comanda.id}`}</strong>
                  <StatusBadge status={comanda.status} />
                </div>
                <span>mesa {comanda.mesa?.numero}</span>
                <span>{comanda.garcom?.nome}</span>
                <div
                  style={{
                    marginTop: '10px',
                    marginBottom: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {comanda.itens?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        borderRadius: '2px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '14px'
                      }}
                    >
                      <strong>
                        {item.quantidade}x {item.produto?.nome}
                      </strong>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '4px'
                        }}
                      >
                        <span>
                          {Number(item.preco_unitario)
                            .toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                        </span>

                        <b>
                          {Number(item.subtotal)
                            .toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                        </b>
                      </div>
                    </div>
                  ))}
                </div>
                <b>{Number(comanda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                {comanda.status === 'pendente' && (
                  <button className="btn warning full" onClick={() => setStatus(comanda, 'em_preparo')} type="button">
                    iniciar preparo
                  </button>
                )}
                {comanda.status === 'em_preparo' && (
                  <button className="btn success full" onClick={() => setStatus(comanda, 'pronto')} type="button">
                    marcar como pronto
                  </button>
                )}
              </article>
            ))}
            {!group.items.length && <p className="muted">Nenhuma comanda.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
