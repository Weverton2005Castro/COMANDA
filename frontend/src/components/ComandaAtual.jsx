import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import useConfirm from '../hooks/useConfirm.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function ComandaAtual({ mesa, comanda, onComandaChange }) {
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { showToast } = useToast();
  const { confirm, Confirm } = useConfirm();

  async function loadComanda() {
    setLoading(true);
    try {
      const { data } = await api.get(`/comandas/mesa/${mesa.id}/ativa`);
      onComandaChange(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComanda();
  }, [mesa.id]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = (updated) => {
      if (updated.mesa_id === mesa.id) onComandaChange(updated.status === 'pago' ? null : updated);
    };
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
  }, [socket, mesa.id]);

  async function removeItem(item) {
    const ok = await confirm({
      title: 'Remover item',
      message: `Remover ${item.produto?.nome || 'item'} da comanda?`
    });
    if (!ok) return;

    try {
      const { data } = await api.delete(`/comandas/${comanda.id}/itens/${item.id}`);
      onComandaChange(data);
      showToast('Item removido.', 'success');
    } catch {
      showToast('Nao foi possivel remover o item.', 'error');
    }
  }

  async function pagar() {
    try {
      const { data } = await api.post(`/comandas/${comanda.id}/pagar`);
      onComandaChange(null);
      showToast(`Comanda ${data.numero_comanda || data.id} paga.`, 'success');
    } catch {
      showToast('Nao foi possivel finalizar o pagamento.', 'error');
    }
  }

  if (loading) return <section className="card"><p>Carregando comanda...</p></section>;

  if (!comanda) {
    return (
      <section className="card empty-state">
        <h2>Comanda Atual</h2>
        <p>Nenhuma comanda ativa para esta mesa.</p>
      </section>
    );
  }

  const canPay = ['pronto', 'esperando_pagamento'].includes(comanda.status);

  return (
    <section className="card">
      <Confirm />
      <div className="section-title">
        <div>
          <h2>{comanda.numero_comanda || `#${comanda.id}`}</h2>
          <span>{new Date(comanda.created_at).toLocaleString('pt-BR')}</span>
        </div>
        <StatusBadge status={comanda.status} />
      </div>
      <div className="meta-list">
        <span>Mesa {mesa.numero}</span>
        <span>Garcom: {comanda.garcom?.nome || '-'}</span>
      </div>
      <div className="items-list">
        {comanda.itens?.map((item) => (
          <div className="item-row" key={item.id}>
            <div>
              <strong>{item.produto?.nome}</strong>
              <span>
                {item.quantidade} x {Number(item.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="item-actions">
              <b>{Number(item.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
              <button className="btn danger small" onClick={() => removeItem(item)} type="button">Remover</button>
            </div>
          </div>
        ))}
      </div>
      <div className="total-line">
        <span>Total</span>
        <strong>{Number(comanda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      </div>
      {canPay && (
        <button className="btn success full" onClick={pagar} type="button">
          Finalizar Pagamento
        </button>
      )}
    </section>
  );
}
