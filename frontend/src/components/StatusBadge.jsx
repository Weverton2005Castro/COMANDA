import React from 'react';
const labels = {
  pendente: 'Pendente',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  pago: 'Pago',
  esperando_pagamento: 'Esperando Pagamento',
  disponivel: 'Disponivel',
  ocupada: 'Ocupada',
  manutencao: 'Manutencao'
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}
