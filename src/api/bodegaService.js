/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * Deducts materials from inventory based on product type using DB Recipes
 * @param {string} productName - The name of the product (e.g., 'BASECAMA DUO')
 * @param {number} quantity - Number of units to produce
 */
export const deducirMaterialesDeProduccion = async (productName, quantity) => {
    if (!productName || quantity <= 0) return;

    try {
        console.log(`Iniciando deducción de inventario para: ${productName} (x${quantity})`);

        // 1. Find Product ID in Catalog
        // Flexible search: exact match or partial match if exact fails
        let { data: products, error: prodError } = await supabase
            .from('catalogo_productos')
            .select('id, nombre')
            .ilike('nombre', `%${productName}%`)
            .limit(1);

        if (prodError) throw prodError;

        let productId = products?.[0]?.id;

        if (!productId) {
            console.warn(`Producto no encontrado en catálogo: ${productName}. Saltando deducción automática.`);
            // Fallback to legacy hardcoded logic could go here if critical, but we assume migration
            return;
        }

        // 2. Find Active Recipe for Product
        const { data: recipe, error: recipeError } = await supabase
            .from('recetas')
            .select(`
                id, 
                recetas_insumos (
                    insumo_id, 
                    cantidad,
                    inventario_insumos (nombre, cantidad)
                )
            `)
            .eq('producto_id', productId)
            .eq('activo', true)
            .single();

        if (recipeError || !recipe) {
            console.warn(`No hay receta activa para: ${products[0].nombre}`);
            return;
        }

        // 3. Deduct Ingredients
        for (const line of recipe.recetas_insumos) {
            const totalToDeduct = line.cantidad * quantity;
            const currentStock = line.inventario_insumos?.cantidad || 0;
            const newStock = Math.max(0, currentStock - totalToDeduct);

            const { error: updateError } = await supabase
                .from('inventario_insumos')
                .update({
                    cantidad: newStock,
                    updated_at: new Date().toISOString()
                })
                .eq('id', line.insumo_id);

            if (updateError) {
                console.error(`Error actualizando stock de insumo ${line.insumo_id}:`, updateError);
            } else {
                console.log(`Deducido ${totalToDeduct} de insumo ${line.insumo_id}. Nuevo stock: ${newStock}`);
                // Optional: Trigger low stock alert here
            }
        }

        toast.info(`Inventario actualizado para ${quantity}x ${products[0].nombre}`);

    } catch (err) {
        console.error('Error CRÍTICO en deducción automática:', err);
        // Don't crash the UI for this background process
    }
};
