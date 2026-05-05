import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useSocket } from '../contexts/SocketContext.jsx';

export default function ResumoFinanceiro() {
  const [resumo, setResumo] = useState(null);
  const { socket } = useSocket();

  async function loadResumo() {
    const { data } = await api.get('/comandas/financeiro/dia');
    setResumo(data);
  }

  useEffect(() => {
    loadResumo();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    socket.on('comanda_paga', loadResumo);
    return () => socket.off('comanda_paga', loadResumo);
  }, [socket]);

  if (!resumo) return <p>Carregando financeiro...</p>;

  const money = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="stack">
      <div className="metrics-grid">
        <article className="metric-card"><span>Total de Comandas</span><strong>{resumo.total_comandas}</strong></article>
        <article className="metric-card"><span>Comandas Pagas</span><strong>{resumo.comandas_pagas}</strong></article>
        <article className="metric-card"><span>Total Vendido</span><strong>{money(resumo.total_vendido)}</strong></article>
        <article className="metric-card"><span>Caixa Atual</span><strong>{money(resumo.caixa_atual)}</strong></article>
      </div>
      <section className="card">
        <h2>Comandas Pagas do Dia</h2>
        <table>
          <thead>
            <tr>
              <th>Comanda</th>
              <th>Mesa</th>
              <th>Garcom</th>
              <th>Total</th>
              <th>Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {resumo.comandas_pagas_dia.map((comanda) => (
              <tr key={comanda.id}>
                <td>{comanda.numero_comanda || `#${comanda.id}`}</td>
                <td>Mesa {comanda.mesa?.numero}</td>
                <td>{comanda.garcom?.nome}</td>
                <td>{money(comanda.total)}</td>
                <td>{new Date(comanda.updated_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
