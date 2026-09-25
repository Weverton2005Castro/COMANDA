import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import useConfirm from '../hooks/useConfirm.jsx';
import StatusBadge from './StatusBadge.jsx';

const initialForm = { numero: '', status: 'disponivel' };

export default function MesasManager() {
  const [mesas, setMesas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const { showToast } = useToast();
  const { confirm, Confirm } = useConfirm();

  async function load() {
    const { data } = await api.get('/mesas');
    setMesas(data);
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      editing ? await api.put(`/mesas/${editing}`, form) : await api.post('/mesas', form);
      setForm(initialForm);
      setEditing(null);
      showToast('mesa salva.', 'success');
      load();
    } catch {
      showToast('não foi possível salvar a mesa.', 'error');
    }
  }

  async function remove(id) {
    if (!(await confirm({ title: 'deletar mesa', message: 'deseja deletar esta mesa?' }))) return;
    await api.delete(`/mesas/${id}`);
    showToast('mesa deletada.', 'success');
    load();
  }

  return (
    <section className="card">
      <Confirm />
      <h2>mesas</h2>
      <form className="manager-form" onSubmit={submit}>
        <input name="numero" placeholder="número" value={form.numero} onChange={update} required />
        <select name="status" value={form.status} onChange={update}>
          <option value="disponivel">disponível</option>
          <option value="ocupada">ocupada</option>
          <option value="manutencao">manutenção</option>
          <option value="esperando_pagamento">esperando pagamento</option>
        </select>
        <button className="btn primary" type="submit">{editing ? 'atualizar' : 'criar'}</button>
      </form>
      <table>
        <thead><tr><th>id</th><th>número</th><th>status</th><th>ações</th></tr></thead>
        <tbody>
          {mesas.map((mesa) => (
            <tr key={mesa.id}>
              <td>{mesa.id}</td>
              <td>{mesa.numero}</td>
              <td><StatusBadge status={mesa.status} /></td>
              <td className="table-actions">
                <button className="btn warning small" onClick={() => { setEditing(mesa.id); setForm({ numero: mesa.numero, status: mesa.status }); }} type="button">editar</button>
                <button className="btn danger small" onClick={() => remove(mesa.id)} type="button">deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
