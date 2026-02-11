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
