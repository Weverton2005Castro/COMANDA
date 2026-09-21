import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest, notFound } from '../utils/errors.js';

export const listUsuarios = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id,tenant_id,nome,email,tipo,created_at')
    .eq('tenant_id', req.user.tenant_id)
    .order('nome');
  if (error) throw badRequest(error.message);
  res.json(data);
});

export const updateUsuario = asyncHandler(async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  const payload = { nome, email, tipo };

  if (senha) {
    payload.senha = await bcrypt.hash(senha, 10);
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(payload)
    .eq('id', req.params.id)
    .eq('tenant_id', req.user.tenant_id)
    .select('id,tenant_id,nome,email,tipo,created_at')
    .single();

  if (error) throw notFound(error.message);
  res.json(data);
});

export const deleteUsuario = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('usuarios').delete().eq('id', req.params.id).eq('tenant_id', req.user.tenant_id);
  if (error) throw badRequest(error.message);
  res.status(204).send();
});
