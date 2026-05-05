import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest, notFound } from '../utils/errors.js';

export const listProdutos = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*').order('categoria').order('nome');
  if (error) throw badRequest(error.message);
  res.json(data);
});

export const createProduto = asyncHandler(async (req, res) => {
  const { nome, preco, categoria, descricao, disponivel = true } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert({ nome, preco, categoria, descricao, disponivel })
    .select('*')
    .single();
  if (error) throw badRequest(error.message);
  res.status(201).json(data);
});

export const updateProduto = asyncHandler(async (req, res) => {
  const { nome, preco, categoria, descricao, disponivel } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .update({ nome, preco, categoria, descricao, disponivel })
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) throw notFound(error.message);
  res.json(data);
});

export const deleteProduto = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('produtos').delete().eq('id', req.params.id);
  if (error) throw badRequest(error.message);
  res.status(204).send();
});
