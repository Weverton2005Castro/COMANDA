import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import Header from '../components/Header.jsx';
import MesaSelector from '../components/MesaSelector.jsx';
import Cardapio from '../components/Cardapio.jsx';
import ComandaAtual from '../components/ComandaAtual.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function GarcomDashboard() {
  const [mesa, setMesa] = useState(null);
  const [comanda, setComanda] = useState(null);
  const navigate = useNavigate()

  function selectMesa(nextMesa) {
    setMesa(nextMesa);
    setComanda(null);
    navigate("/cardapio")
  }

  return (
    <div>
      <Header title="Painel do Garcom" />
      <main className="container">
        <MesaSelector selectedMesa={mesa} onSelect={selectMesa} />
        {mesa && (
          <div className="dashboard-grid">
            <div className="stack">
              <section className="card mesa-summary">
                <h2>Mesa {mesa.numero}</h2>
                <StatusBadge status={mesa.status} />
              </section>
              {/* <Cardapio mesa={mesa} comanda={comanda} onComandaChange={setComanda} /> */}
            </div>
            <ComandaAtual mesa={mesa} comanda={comanda} onComandaChange={setComanda} />
          </div>
        )}
      </main>
    </div>
  );
}
