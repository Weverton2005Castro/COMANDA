import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Supabase nao configurado. Confira SUPABASE_URL e SUPABASE_SERVICE_KEY.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '', {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: WebSocket
  }
});
