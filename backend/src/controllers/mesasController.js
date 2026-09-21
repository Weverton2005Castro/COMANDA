import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest, notFound } from '../utils/errors.js';

export const listMesas = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('mesas').select('*').eq('tenant_id', req.user.tenant_id).order('numero');
  if (error) throw badRequest(error.message);
  res.json(data);
});

export const createMesa = asyncHandler(async (req, res) => {
  const { numero, status = 'disponivel' } = req.body;
  const { data, error } = await supabase.from('mesas').insert({ numero, status, tenant_id: req.user.tenant_id }).select('*').single();
  if (error) throw badRequest(error.message);
  res.status(201).json(data);
});

export const updateMesa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { numero, status } = req.body;
  const { data, error } = await supabase.from('mesas').update({ numero, status }).eq('id', id).eq('tenant_id', req.user.tenant_id).select('*').single();
  if (error) throw notFound(error.message);
  res.json(data);
});

export const deleteMesa = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('mesas').delete().eq('id', req.params.id).eq('tenant_id', req.user.tenant_id);
  if (error) throw badRequest(error.message);
  res.status(204).send();
});
