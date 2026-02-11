/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useOrders = (statusFilter = 'PENDIENTE', autoFetch = true) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('estado', statusFilter)
        .order('fecha_ingreso', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error(`Error al cargar pedidos (${statusFilter})`);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const dispatchOrder = async (orderId, dispatchData) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          estado: 'ENVIADO',
          guia_transporte: dispatchData.guia_transporte.toUpperCase(),
          transportadora: dispatchData.transportadora,
          fecha_despacho: dispatchData.fecha_despacho
        })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Pedido despachado correctamente');
      fetchOrders(); // Refresh list
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Error al despachar pedido');
      return false;
    }
  };

  useEffect(() => {
    if (autoFetch) fetchOrders();
  }, [fetchOrders, autoFetch]);

  return {
    orders,
    loading,
    fetchOrders,
    dispatchOrder
  };
};
