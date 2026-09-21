import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

if (!isSupabaseConfigured) {
  console.warn('Supabase nao configurado. Confira SUPABASE_URL e SUPABASE_SERVICE_KEY.');
}

// Do not instantiate the client with empty credentials: the Supabase SDK throws
// before Express can start and expose a useful health endpoint.
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      },
      realtime: {
        transport: WebSocket
      }
    })
  : null;
