import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useWorkers = (autoFetch = true) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('operarios')
                .select('*')
                .order('nombre');

            if (error) throw error;
            setWorkers(data || []);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar personal');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) fetchWorkers();
    }, [fetchWorkers, autoFetch]);

    return {
        workers,
        loading,
        fetchWorkers
    };
};
