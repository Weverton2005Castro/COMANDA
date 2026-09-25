import React from 'react';
const labels = {
  pendente: 'pendente',
  em_preparo: 'em preparo',
  pronto: 'pronto',
  pago: 'pago',
  esperando_pagamento: 'esperando pagamento',
  disponivel: 'disponível',
  ocupada: 'ocupada',
  manutencao: 'manutenção'
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}
