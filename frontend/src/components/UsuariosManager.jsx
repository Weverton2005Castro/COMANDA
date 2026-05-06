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
    showToast('Usuario salvo.', 'success');
    load();
  }

  async function remove(id) {
    if (!(await confirm({ title: 'Deletar usuario', message: 'Deseja deletar este usuario?' }))) return;
    await api.delete(`/usuarios/${id}`);
    showToast('Usuario deletado.', 'success');
    load();
  }

  return (
    <section className="card">
      <Confirm />
      <h2>Usuarios</h2>
      <form className="manager-form wide" onSubmit={submit}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={update} required />
        <input name="email" placeholder="Email" type="text" value={form.email} onChange={update} required />
        <input name="senha" placeholder={editing ? 'Nova senha opcional' : 'Senha'} type="password" value={form.senha} onChange={update} required={!editing} />
        <select name="tipo" value={form.tipo} onChange={update}>
          <option value="garcom">Garcom</option>
          <option value="gestor">Gestor</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn primary" type="submit">{editing ? 'Atualizar' : 'Criar'}</button>
      </form>
      <table>
        <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Tipo</th><th>Acoes</th></tr></thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.tipo}</td>
              <td className="table-actions">
                <button className="btn warning small" onClick={() => { setEditing(usuario.id); setForm({ nome: usuario.nome, email: usuario.email, senha: '', tipo: usuario.tipo }); }} type="button">Editar</button>
                <button className="btn danger small" onClick={() => remove(usuario.id)} type="button">Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
