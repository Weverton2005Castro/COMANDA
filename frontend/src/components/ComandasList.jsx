import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import StatusBadge from './StatusBadge.jsx';

const groups = [
  { status: 'pendente', title: '🟡 Pendentes' },
  { status: 'em_preparo', title: '🔵 Em Preparo' },
  { status: 'pronto', title: '🟢 Prontos' },
  { status: 'pago', title: '⚫ Pagos' }
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

  async function setStatus(comanda, status) {
    try {
      await api.put(`/comandas/${comanda.id}/status`, { status });
      showToast('Status atualizado.', 'success');
      loadComandas();
    } catch {
      showToast('Nao foi possivel atualizar o status.', 'error');
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
                <span>Mesa {comanda.mesa?.numero}</span>
                <span>{comanda.garcom?.nome}</span>
                <b>{Number(comanda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                {comanda.status === 'pendente' && (
                  <button className="btn warning full" onClick={() => setStatus(comanda, 'em_preparo')} type="button">
                    Iniciar Preparo
                  </button>
                )}
                {comanda.status === 'em_preparo' && (
                  <button className="btn success full" onClick={() => setStatus(comanda, 'pronto')} type="button">
                    Marcar como Pronto
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
