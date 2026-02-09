import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error: err } = await supabase
                .from('inventario_insumos')
                .select('*')
                .order('nombre');

            if (err) throw err;
            setItems(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar inventario');
            toast.error('Error al conectar con la base de datos');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStock = async (id, delta) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQty = Math.max(0, parseFloat(item.cantidad) + delta);

        // Optimistic update
        setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: newQty } : i));

        const { error: err } = await supabase
            .from('inventario_insumos')
            .update({ cantidad: newQty, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (err) {
            // Revert on error
            setItems(prev => prev.map(i => i.id === id ? item : i));
            toast.error('Error al actualizar stock');
        }
    };

    const saveItem = async (itemData, isEditing = false) => {
        const payload = {
            ...itemData,
            nombre: itemData.nombre.toUpperCase(),
            updated_at: new Date().toISOString()
        };

        try {
            if (isEditing) {
                const { error: err } = await supabase
                    .from('inventario_insumos')
                    .update(payload)
                    .eq('id', itemData.id);
                if (err) throw err;
                toast.success('Actualizado correctamente');
            } else {
                const { error: err } = await supabase
                    .from('inventario_insumos')
                    .insert([payload]);
                if (err) throw err;
                toast.success('Agregado correctamente');
            }
            fetchItems(); // Refresh to get exact DB state
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar item');
            return false;
        }
    };

    const deleteItem = async (id) => {
        try {
            const { error: err } = await supabase
                .from('inventario_insumos')
                .delete()
                .eq('id', id);

            if (err) throw err;
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success('Eliminado');
            return true;
        } catch (err) {
            toast.error('Error al eliminar');
            return false;
        }
    };

    // Auto-fetch on mount & Realtime subscription
    useEffect(() => {
        fetchItems();

        const subscription = supabase
            .channel('inventario_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_insumos' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setItems(prev => [...prev, payload.new].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                } else if (payload.eventType === 'UPDATE') {
                    setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                } else if (payload.eventType === 'DELETE') {
                    setItems(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchItems]);

    return {
        items,
        loading,
        error,
        fetchItems,
        updateStock,
        saveItem,
        deleteItem
    };
};
