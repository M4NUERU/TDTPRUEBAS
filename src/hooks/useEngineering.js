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

export const useEngineering = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('catalogo_productos')
                .select('*')
                .order('nombre');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('Error cargando catálogo');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecipes = useCallback(async (productId) => {
        try {
            const { data, error } = await supabase
                .from('recetas')
                .select(`
                    *,
                    recetas_insumos (
                        *,
                        inventario_insumos (nombre, codigo)
                    )
                `)
                .eq('producto_id', productId);

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    const saveProduct = async (productData) => {
        try {
            const { error } = await supabase
                .from('catalogo_productos')
                .upsert(productData);

            if (error) throw error;
            toast.success('Producto guardado');
            fetchProducts();
            return true;
        } catch (err) {
            toast.error('Error al guardar: ' + err.message);
            return false;
        }
    };

    const saveRecipe = async (recipeData, ingredients) => {
        try {
            // 1. Save Header
            const { data: recipe, error: recipeError } = await supabase
                .from('recetas')
                .upsert(recipeData)
                .select()
                .single();

            if (recipeError) throw recipeError;

            // 2. Save Ingredients (Delete old, insert new for simplicity in this MVP)
            await supabase.from('recetas_insumos').delete().eq('receta_id', recipe.id);

            if (ingredients.length > 0) {
                const ingredientsPayload = ingredients.map(ing => ({
                    receta_id: recipe.id,
                    insumo_id: ing.insumo_id,
                    cantidad: ing.cantidad,
                    unidad_medida: ing.unidad_medida
                }));

                const { error: ingError } = await supabase
                    .from('recetas_insumos')
                    .insert(ingredientsPayload);

                if (ingError) throw ingError;
            }

            toast.success('Receta guardada con éxito');
            return true;
        } catch (err) {
            toast.error('Error al guardar receta: ' + err.message);
            return false;
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        fetchProducts,
        fetchRecipes,
        saveProduct,
        saveRecipe
    };
};
