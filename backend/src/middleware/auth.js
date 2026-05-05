import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token nao informado' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id,nome,email,tipo,created_at')
      .eq('id', payload.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Usuario invalido' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalido ou expirado' });
  }
}

export function permit(...types) {
  return (req, res, next) => {
    if (!types.includes(req.user.tipo)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
}
