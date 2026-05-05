import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import StatusBadge from './StatusBadge.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';

export default function MesaSelector({ selectedMesa, onSelect }) {
  const [mesas, setMesas] = useState([]);
  const { socket } = useSocket();

  async function loadMesas() {
    const { data } = await api.get('/mesas');
    setMesas(data);
  }

  useEffect(() => {
    loadMesas();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => loadMesas();
    socket.on('comanda_criada', refresh);
    socket.on('comanda_paga', refresh);
    return () => {
      socket.off('comanda_criada', refresh);
      socket.off('comanda_paga', refresh);
    };
  }, [socket]);

  return (
    <section className="panel-section">
      <h2>Selecione a Mesa</h2>
      <div className="mesa-grid">
        {mesas.map((mesa) => (
          <button
            className={`mesa-card ${selectedMesa?.id === mesa.id ? 'active' : ''}`}
            disabled={mesa.status === 'manutencao'}
            key={mesa.id}
            onClick={() => onSelect(mesa)}
            type="button"
          >
            <strong>Mesa {mesa.numero}</strong>
            <StatusBadge status={mesa.status} />
          </button>
        ))}
      </div>
    </section>
  );
}
