import { supabase } from '../config/supabase.js';
import { asyncHandler, badRequest, notFound } from '../utils/errors.js';
import { formatComandaNumber } from '../utils/format.js';

const comandaSelect = `
  *,
  mesa:mesas(*),
  garcom:usuarios(id,nome,email,tipo),
  itens:itens_comanda(
    *,
    produto:produtos(*)
  )
`;

async function getComanda(id) {
  const { data, error } = await supabase.from('comandas').select(comandaSelect).eq('id', id).single();
  if (error || !data) throw notFound('Comanda nao encontrada');
  return data;
}

export const listComandas = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('comandas')
    .select(comandaSelect)
    .order('created_at', { ascending: false });

  if (error) throw badRequest(error.message);
  res.json(data);
});

export const getComandaAtivaByMesa = asyncHandler(async (req, res) => {

  const { data, error } = await supabase
    .from('comandas')
    .select(comandaSelect)
    .eq('mesa_id', req.params.mesaId)
    .neq('status', 'pago')
    .order('created_at', { ascending: false });
  if (error) {
    throw badRequest(error.message);
  }

  res.json(data[0] || null);
});

export const createComanda = asyncHandler(async (req, res) => {

  const { mesa_id, itens = [] } = req.body;

  if (!mesa_id) {
    throw badRequest('mesa_id e obrigatorio');
  }

  // VERIFICA SE JA EXISTE COMANDA ATIVA
  const { data: existente, error: errorExistente } = await supabase
    .from('comandas')
    .select(comandaSelect)
    .eq('mesa_id', mesa_id)
    .neq('status', 'pago')
    .maybeSingle();

  if (errorExistente) {
    throw badRequest(errorExistente.message);
  }

  // SE EXISTIR, RETORNA ELA
  if (existente) {
    return res.json(existente);
  }

  // CRIA NOVA COMANDA
  const { data: created, error } = await supabase
    .from('comandas')
    .insert({
      mesa_id,
      garcom_id: req.user.id,
      status: 'pendente',
      total: 0
    })
    .select('*')
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  const numeroComanda = formatComandaNumber(created.id);

  await supabase
    .from('comandas')
    .update({ numero_comanda: numeroComanda })
    .eq('id', created.id);

  if (itens.length) {
    await insertItens(created.id, itens);
  }

  const comanda = await getComanda(created.id);

  req.io.emit('comanda_criada', comanda);

  res.status(201).json(comanda);
});

async function insertItens(comandaId, itens) {
  const productIds = itens.map((item) => item.produto_id);
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('*')
    .in('id', productIds)
    .eq('disponivel', true);

  if (error) throw badRequest(error.message);

  const rows = itens.map((item) => {
    const produto = produtos.find((entry) => entry.id === item.produto_id);
    if (!produto) throw badRequest('Produto indisponivel ou inexistente');
    const quantidade = Number(item.quantidade || 1);
    const precoUnitario = Number(produto.preco);

    return {
      comanda_id: comandaId,
      produto_id: produto.id,
      quantidade,
      preco_unitario: precoUnitario
    };
  });

  const { error: insertError } = await supabase.from('itens_comanda').insert(rows);
  if (insertError) throw badRequest(insertError.message);
}

export const addItens = asyncHandler(async (req, res) => {
  const { itens = [] } = req.body;
  if (!itens.length) throw badRequest('Informe ao menos um item');

  const comanda = await getComanda(req.params.id);
  if (comanda.status === 'pago') throw badRequest('Comanda paga nao pode receber itens');

  await insertItens(req.params.id, itens);
  const updated = await getComanda(req.params.id);
  req.io.emit('comanda_atualizada', updated);
  res.status(201).json(updated);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const comanda = await getComanda(req.params.id);
  if (comanda.status === 'pago') throw badRequest('Comanda paga nao pode ser alterada');

  const { error } = await supabase
    .from('itens_comanda')
    .delete()
    .eq('id', req.params.itemId)
    .eq('comanda_id', req.params.id);

  if (error) throw badRequest(error.message);

  const updated = await getComanda(req.params.id);
  req.io.emit('comanda_atualizada', updated);
  res.json(updated);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('comandas')
    .update({ status })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) throw badRequest(error.message);

  const updated = await getComanda(data.id);
  req.io.emit('comanda_status_atualizado', updated);
  res.json(updated);
});

export const pagarComanda = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('comandas')
    .update({ status: 'pago' })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) throw badRequest(error.message);

  const updated = await getComanda(data.id);
  req.io.emit('comanda_paga', updated);
  res.json(updated);
});

export const financeiroDia = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  const { data: comandas, error } = await supabase
    .from('comandas')
    .select(comandaSelect)
    .gte('updated_at', start)
    .lte('updated_at', end)
    .order('updated_at', { ascending: false });

  if (error) throw badRequest(error.message);

  const pagas = comandas.filter((comanda) => comanda.status === 'pago');
  const totalVendido = pagas.reduce((sum, comanda) => sum + Number(comanda.total || 0), 0);

  res.json({
    data: today,
    total_comandas: comandas.length,
    comandas_pagas: pagas.length,
    total_vendido: totalVendido,
    caixa_atual: totalVendido,
    comandas_pagas_dia: pagas
  });
});
