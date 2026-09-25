import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import useConfirm from '../hooks/useConfirm.jsx';

const initialForm = { nome: '', preco: '', categoria: 'prato', descricao: '', disponivel: true };

export default function ProdutosManager() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const { showToast } = useToast();
  const { confirm, Confirm } = useConfirm();

  async function load() {
    const { data } = await api.get('/produtos');
    setProdutos(data);
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, preco: Number(form.preco) };
    editing ? await api.put(`/produtos/${editing}`, payload) : await api.post('/produtos', payload);
    setForm(initialForm);
    setEditing(null);
    showToast('produto salvo.', 'success');
    load();
  }

  async function remove(id) {
    if (!(await confirm({ title: 'deletar produto', message: 'deseja deletar este produto?' }))) return;
    await api.delete(`/produtos/${id}`);
    showToast('produto deletado.', 'success');
    load();
  }

  async function toggle(produto) {
    await api.put(`/produtos/${produto.id}`, { ...produto, disponivel: !produto.disponivel });
    showToast('disponibilidade atualizada.', 'success');
    load();
  }

  return (
    <section className="card">
      <Confirm />
      <h2>cardápio</h2>
      <form className="manager-form wide" onSubmit={submit}>
        <input name="nome" placeholder="nome" value={form.nome} onChange={update} required />
        <input name="preco" placeholder="preço" type="number" step="0.01" value={form.preco} onChange={update} required />
        <select name="categoria" value={form.categoria} onChange={update}>
          <option value="prato">prato</option>
          <option value="bebida">bebida</option>
          <option value="extra">extra</option>
        </select>
        <input name="descricao" placeholder="descrição" value={form.descricao} onChange={update} />
        <label className="checkbox-label"><input name="disponivel" type="checkbox" checked={form.disponivel} onChange={update} /> disponível</label>
        <button className="btn primary" type="submit">{editing ? 'atualizar' : 'criar'}</button>
      </form>
      <table>
        <thead><tr><th>id</th><th>nome</th><th>preço</th><th>categoria</th><th>disponível</th><th>ações</th></tr></thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{produto.categoria}</td>
              <td>{produto.disponivel ? 'sim' : 'não'}</td>
              <td className="table-actions">
                <button className="btn warning small" onClick={() => { setEditing(produto.id); setForm({ nome: produto.nome, preco: produto.preco, categoria: produto.categoria, descricao: produto.descricao || '', disponivel: produto.disponivel }); }} type="button">editar</button>
                <button className="btn secondary small" onClick={() => toggle(produto)} type="button">{produto.disponivel ? 'desativar' : 'ativar'}</button>
                <button className="btn danger small" onClick={() => remove(produto.id)} type="button">deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
