import { supabase } from '../lib/supabase';

export const fetchPedidos = async (params = {}) => {
  const {
    page = 1,
    perPage = 50,
    searchTerm = '',
    statusFilter = 'TODOS',
    priorityFilter = false,
    startDate = '',
    endDate = '',
    sortOrder = 'desc'
  } = params;

  let query = supabase.from('pedidos').select('*', { count: 'exact' });

  if (searchTerm) {
    query = query.or(`cliente.ilike.%${searchTerm}%,orden_compra.ilike.%${searchTerm}%,producto.ilike.%${searchTerm}%`);
  }
  if (statusFilter && statusFilter !== 'TODOS') {
    query = query.eq('estado', statusFilter);
  }
  if (priorityFilter) {
    query = query.eq('prioridad', true);
  }
  if (startDate) {
    query = query.gte('fecha_ingreso', startDate);
  }
  if (endDate) {
    query = query.lte('fecha_ingreso', endDate);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);
  query = query.order('fecha_ingreso', { ascending: sortOrder === 'asc' });

  const { data, count, error } = await query;
  return { data, count, error };
};

export const upsertPedidos = async (pedidos) => {
  return await supabase.from('pedidos').upsert(pedidos, { onConflict: 'orden_compra' });
};
