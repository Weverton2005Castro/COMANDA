import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest, notFound } from '../utils/errors.js';

export const listProdutos = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*').eq('tenant_id', req.user.tenant_id).order('categoria').order('nome');
  if (error) throw badRequest(error.message);
  res.json(data);
});

export const listCardapioPublico = asyncHandler(async (req, res) => {
  const { data: restaurante, error: restauranteError } = await supabase
    .from('restaurantes')
    .select('id,nome')
    .eq('id', req.params.restauranteId)
    .maybeSingle();

  if (restauranteError) throw badRequest(restauranteError.message);
  if (!restaurante) throw notFound('Restaurante nao encontrado');

  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('id,nome,preco,categoria,descricao')
    .eq('tenant_id', restaurante.id)
    .eq('disponivel', true)
    .order('categoria')
    .order('nome');

  if (error) throw badRequest(error.message);
  res.json({ restaurante, produtos });
});

export const createProduto = asyncHandler(async (req, res) => {
  const { nome, preco, categoria, descricao, disponivel = true } = req.body;
  const { data, error } = await supabase
    .from('produtos')
    .insert({ nome, preco, categoria, descricao, disponivel, tenant_id: req.user.tenant_id })
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
    .eq('tenant_id', req.user.tenant_id)
    .select('*')
    .single();
  if (error) throw notFound(error.message);
  res.json(data);
});

export const deleteProduto = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('produtos').delete().eq('id', req.params.id).eq('tenant_id', req.user.tenant_id);
  if (error) throw badRequest(error.message);
  res.status(204).send();
});
