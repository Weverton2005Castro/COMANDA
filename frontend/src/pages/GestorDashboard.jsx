import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import ComandasList from '../components/ComandasList.jsx';
import ResumoFinanceiro from '../components/ResumoFinanceiro.jsx';

export default function GestorDashboard() {
  const [tab, setTab] = useState('comandas');

  return (
    <div>
      <Header title="Painel do Gestor" />
      <main className="container">
        <div className="tabs page-tabs">
          <button className={tab === 'comandas' ? 'active' : ''} onClick={() => setTab('comandas')} type="button">Comandas</button>
          <button className={tab === 'financeiro' ? 'active' : ''} onClick={() => setTab('financeiro')} type="button">Financeiro</button>
        </div>
        {tab === 'comandas' ? <ComandasList /> : <ResumoFinanceiro />}
      </main>
    </div>
  );
}
