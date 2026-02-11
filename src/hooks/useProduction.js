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
import { deducirMaterialesDeProduccion } from '../api/bodegaService';

export const useProduction = (selectedDate) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAssignments = useCallback(async () => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('asignaciones')
                .select('*, pedidos(*), operarios(*)')
                .eq('fecha', selectedDate);

            if (error) throw error;
            setAssignments(data || []);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar asignaciones');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    const assignOrder = async (orderId, workerId, quantity) => {
        try {
            const { error } = await supabase.from('asignaciones').insert([{
                pedido_id: orderId,
                operario_id: workerId,
                fecha: selectedDate,
                estado: 'PENDIENTE',
                unidades_totales: quantity,
                unidades_completadas: 0
            }]);
            if (error) throw error;

            // Deduct inventory automatically
            const { data: order } = await supabase.from('pedidos').select('producto').eq('id', orderId).single();
            if (order) {
                deducirMaterialesDeProduccion(order.producto, quantity);
            }

            toast.success('Asignación creada');
            fetchAssignments();
            return true;
        } catch (err) {
            toast.error('Error al asignar');
            return false;
        }
    };

    const removeAssignment = async (id) => {
        try {
            const { error } = await supabase.from('asignaciones').delete().eq('id', id);
            if (error) throw error;
            fetchAssignments();
            toast.success('Asignación eliminada');
        } catch (err) {
            toast.error('Error al eliminar asignación');
        }
    };

    const updateProgress = async (assignment, delta, qualityData = null) => {
        const newCompleted = Math.max(0, Math.min(assignment.unidades_totales, assignment.unidades_completadas + delta));
        const isFinished = newCompleted === assignment.unidades_totales;

        const payload = {
            unidades_completadas: newCompleted,
            estado: isFinished ? 'TERMINADO' : 'PENDIENTE'
        };

        if (qualityData) {
            payload.calidad = qualityData;
        }

        const { error } = await supabase
            .from('asignaciones')
            .update(payload)
            .eq('id', assignment.id);

        if (!error) {
            // Update global order status if finished
            // Note: Ideally this should be a trigger in DB, but we do it here for now
            const { error: pError } = await supabase.from('pedidos').update({
                estado: isFinished ? 'TERMINADO' : 'PENDIENTE',
                operario_asignado: assignment.operarios?.nombre,
                fecha_terminado: isFinished ? new Date().toISOString() : null
            }).eq('id', assignment.pedido_id);

            if (!pError) {
                if (isFinished) toast.success('¡Pedido terminado!');
                fetchAssignments();
            }
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    return {
        assignments,
        loading,
        fetchAssignments,
        assignOrder,
        removeAssignment,
        updateProgress
    };
};
