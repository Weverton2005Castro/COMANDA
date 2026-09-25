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

  if (!resumo) return <p>carregando financeiro...</p>;

  const money = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="stack">
      <div className="metrics-grid">
        <article className="metric-card"><span>total de comandas</span><strong>{resumo.total_comandas}</strong></article>
        <article className="metric-card"><span>comandas pagas</span><strong>{resumo.comandas_pagas}</strong></article>
        <article className="metric-card"><span>total vendido</span><strong>{money(resumo.total_vendido)}</strong></article>
        <article className="metric-card"><span>caixa atual</span><strong>{money(resumo.caixa_atual)}</strong></article>
      </div>
      <section className="card">
        <h2>comandas pagas do dia</h2>
        <table>
          <thead>
            <tr>
              <th>comanda</th>
              <th>mesa</th>
              <th>garçom</th>
              <th>total</th>
              <th>pagamento</th>
            </tr>
          </thead>
          <tbody>
            {resumo.comandas_pagas_dia.map((comanda) => (
              <tr key={comanda.id}>
                <td>{comanda.numero_comanda || `#${comanda.id}`}</td>
                <td>mesa {comanda.mesa?.numero}</td>
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
