/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const usePurchasing = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('proveedores').select('*').order('razon_social');
            if (error) throw error;
            setSuppliers(data || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchOrders = useCallback(async (companyFilter = 'ALL') => {
        setLoading(true);
        try {
            let query = supabase
                .from('ordenes_compra')
                .select(`
                    *,
                    proveedores (razon_social),
                    ordenes_compra_detalles (
                        *,
                        inventario_insumos (nombre, codigo)
                    )
                `)
                .order('created_at', { ascending: false });

            if (companyFilter !== 'ALL') {
                query = query.eq('empresa_solicitante', companyFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error(err);
            toast.error('Error cargando órdenes');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveSupplier = async (data) => {
        try {
            const { error } = await supabase.from('proveedores').upsert(data);
            if (error) throw error;
            toast.success('Proveedor guardado');
            fetchSuppliers();
            return true;
        } catch (err) {
            toast.error('Error: ' + err.message);
            return false;
        }
    };

    const saveOrder = async (orderData, details) => {
        try {
            // 1. Save Header
            const { data: order, error: orderError } = await supabase
                .from('ordenes_compra')
                .upsert(orderData)
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Save Details (Simple strategy: delete all and recreate for draft editing)
            // Only if state is BORRADOR. If SENT/RECEIVED, we might block editing or handle differently.
            if (order.estado === 'BORRADOR') {
                await supabase.from('ordenes_compra_detalles').delete().eq('orden_id', order.id);

                if (details.length > 0) {
                    const detailPayload = details.map(d => ({
                        orden_id: order.id,
                        insumo_id: d.insumo_id,
                        cantidad_solicitada: d.cantidad_solicitada,
                        precio_unitario: d.precio_unitario
                    }));
                    const { error: detError } = await supabase.from('ordenes_compra_detalles').insert(detailPayload);
                    if (detError) throw detError;
                }
            }

            toast.success('Orden de compra guardada');
            return true;
        } catch (err) {
            toast.error('Error: ' + err.message);
            return false;
        }
    };

    const receiveOrder = async (orderId) => {
        // Complex logic: Update Order status AND Increment Inventory Trigger
        // For simplicity in Frontend, we'll do client-side sequential updates or call a future Edge Function
        // Here: Client-side transaction simulation
        try {
            // 1. Get Details
            const { data: details } = await supabase.from('ordenes_compra_detalles').select('*').eq('orden_id', orderId);

            // 2. Update Inventory
            for (const item of details) {
                // Fetch current stock
                const { data: inv } = await supabase.from('inventario_insumos').select('cantidad').eq('id', item.insumo_id).single();
                const newStock = Number(inv.cantidad) + Number(item.cantidad_solicitada);

                await supabase.from('inventario_insumos').update({ cantidad: newStock }).eq('id', item.insumo_id);
            }

            // 3. Update Order Status
            await supabase.from('ordenes_compra').update({ estado: 'RECIBIDA', fecha_entrega_estimada: new Date() }).eq('id', orderId);

            toast.success('Mercancía recibida e inventario actualizado');
            fetchOrders();
        } catch (err) {
            toast.error('Error recibiendo orden: ' + err.message);
        }
    };

    useEffect(() => {
        fetchSuppliers();
        fetchOrders(); // Default load all
    }, [fetchSuppliers, fetchOrders]);

    return {
        suppliers,
        orders,
        loading,
        fetchOrders,
        saveSupplier,
        saveOrder,
        receiveOrder
    };
};
