import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest } from '../utils/errors.js';

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET nao configurado no servidor');
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    { id: user.id, tipo: user.tipo, tenant_id: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

function publicUser(user) {
  const { senha, ...rest } = user;
  return rest;
}

export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    throw badRequest('Email e senha sao obrigatorios');
  }

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (error || !user) {
    return res.status(401).json({ message: 'Credenciais invalidas' });
  }

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) {
    return res.status(401).json({ message: 'Credenciais invalidas' });
  }

  res.json({
    token: signToken(user),
    user: publicUser(user)
  });
});

export const onboarding = asyncHandler(async (req, res) => {
  const { restaurante, nome, email, senha } = req.body;

  if (!restaurante || !nome || !email || !senha) {
    throw badRequest('Restaurante, nome, email e senha sao obrigatorios');
  }

  const hash = await bcrypt.hash(senha, 10);
  const { data, error } = await supabase.rpc('criar_restaurante_onboarding', {
    p_restaurante: restaurante,
    p_nome: nome,
    p_email: email,
    p_senha_hash: hash
  });

  if (error || !data?.[0]) throw badRequest(error?.message || 'Nao foi possivel criar o restaurante');

  const user = data[0];
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('restaurantes')
    .update({ onboarding_concluido: true })
    .eq('id', req.user.tenant_id);
  if (error) throw badRequest(error.message);
  res.status(204).send();
});

export const register = asyncHandler(async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    throw badRequest('Nome, email, senha e tipo sao obrigatorios');
  }

  const hash = await bcrypt.hash(senha, 10);
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ nome, email, senha: hash, tipo, tenant_id: req.user.tenant_id })
    .select('id,tenant_id,nome,email,tipo,created_at')
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.status(201).json(data);
});
