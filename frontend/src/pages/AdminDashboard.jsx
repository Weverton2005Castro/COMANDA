import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import MesasManager from '../components/MesasManager.jsx';
import ProdutosManager from '../components/ProdutosManager.jsx';
import UsuariosManager from '../components/UsuariosManager.jsx';

export default function AdminDashboard() {
  const [tab, setTab] = useState('mesas');

  return (
    <div>
      <Header title="painel do administrador" />
      <main className="container">
        <div className="tabs page-tabs">
          <button className={tab === 'mesas' ? 'active' : ''} onClick={() => setTab('mesas')} type="button">mesas</button>
          <button className={tab === 'produtos' ? 'active' : ''} onClick={() => setTab('produtos')} type="button">cardápio</button>
          <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')} type="button">usuários</button>
        </div>
        {tab === 'mesas' && <MesasManager />}
        {tab === 'produtos' && <ProdutosManager />}
        {tab === 'usuarios' && <UsuariosManager />}
      </main>
    </div>
  );
}
