import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import useConfirm from '../hooks/useConfirm.jsx';

const initialForm = { nome: '', email: '', senha: '', tipo: 'garcom' };

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const { showToast } = useToast();
  const { confirm, Confirm } = useConfirm();

  async function load() {
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    const payload = editing && !form.senha ? { nome: form.nome, email: form.email, tipo: form.tipo } : form;
    editing ? await api.put(`/usuarios/${editing}`, payload) : await api.post('/auth/register', form);
    setForm(initialForm);
    setEditing(null);
    showToast('usuário salvo.', 'success');
    load();
  }

  async function remove(id) {
    if (!(await confirm({ title: 'deletar usuário', message: 'deseja deletar este usuário?' }))) return;
    await api.delete(`/usuarios/${id}`);
    showToast('usuário deletado.', 'success');
    load();
  }

  return (
    <section className="card">
      <Confirm />
      <h2>usuários</h2>
      <form className="manager-form wide" onSubmit={submit}>
        <input name="nome" placeholder="nome" value={form.nome} onChange={update} required />
        <input name="email" placeholder="email" type="text" value={form.email} onChange={update} required />
        <input name="senha" placeholder={editing ? 'nova senha opcional' : 'senha'} type="password" value={form.senha} onChange={update} required={!editing} />
        <select name="tipo" value={form.tipo} onChange={update}>
          <option value="garcom">garçom</option>
          <option value="gestor">gestor</option>
          <option value="admin">admin</option>
        </select>
        <button className="btn primary" type="submit">{editing ? 'atualizar' : 'criar'}</button>
      </form>
      <table>
        <thead><tr><th>id</th><th>nome</th><th>email</th><th>tipo</th><th>ações</th></tr></thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.tipo}</td>
              <td className="table-actions">
                <button className="btn warning small" onClick={() => { setEditing(usuario.id); setForm({ nome: usuario.nome, email: usuario.email, senha: '', tipo: usuario.tipo }); }} type="button">editar</button>
                <button className="btn danger small" onClick={() => remove(usuario.id)} type="button">deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
