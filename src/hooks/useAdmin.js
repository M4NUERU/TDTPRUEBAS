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

export const useAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        scanned: 0,
        pending: 0,
        staff: 0,
        lowStock: 0
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('usuarios').select('*').order('nombre');
            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const [pedidos, usuarios, inventario] = await Promise.all([
                supabase.from('pedidos').select('estado', { count: 'exact', head: true }),
                supabase.from('usuarios').select('id', { count: 'exact', head: true }),
                supabase.from('inventario_insumos').select('cantidad, stock_minimo')
            ]);

            // Note: Real stats logic might be more complex, simplifying for this refactor baseline
            // Ideally we'd do a count query for each status, but Supabase generic select is okay for now
            const { count: pendingCount } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'PENDIENTE');

            // Calculate low stock items in JS since we fetched them (or do a filter query)
            const lowStockCount = (inventario.data || []).filter(i => i.cantidad <= (i.stock_minimo || 5)).length;

            setStats({
                scanned: pedidos.count || 0, // Total orders as proxy
                pending: pendingCount || 0,
                staff: usuarios.count || 0,
                lowStock: lowStockCount
            });
        } catch (error) {
            console.error(error);
        }
    }, []);

    const saveUser = async (userData, isEditing = false) => {
        try {
            const payload = {
                ...userData,
                updated_at: new Date().toISOString()
            };

            if (isEditing) {
                const { error } = await supabase.from('usuarios').update(payload).eq('id', userData.id);
                if (error) throw error;
                toast.success('Usuario actualizado');
            } else {
                const { error } = await supabase.from('usuarios').insert([payload]);
                if (error) throw error;
                toast.success('Usuario creado');
            }
            fetchUsers();
            return true;
        } catch (err) {
            toast.error('Error al guardar usuario');
            return false;
        }
    };

    const deleteUser = async (id) => {
        try {
            const { error } = await supabase.from('usuarios').delete().eq('id', id);
            if (error) throw error;
            toast.success('Usuario eliminado');
            fetchUsers();
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const resetPassword = async (id, newPin) => {
        try {
            const { error } = await supabase.from('usuarios').update({ pin_acceso: newPin }).eq('id', id);
            if (error) throw error;
            toast.success('PIN restablecido');
        } catch (err) {
            toast.error('Error al cambiar PIN');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    return {
        users,
        stats,
        loading,
        fetchUsers,
        fetchStats,
        saveUser,
        deleteUser,
        resetPassword
    };
};
