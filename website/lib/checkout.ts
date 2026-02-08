import { supabase } from './supabase';

/**
 * Función de ejemplo para registrar un pedido desde la tienda virtual
 */
/**
 * Registra un pedido a través de nuestra API segura (Server-Side)
 */
export const registerWebOrder = async (orderData: {
    orden_compra: string;
    cliente: string;
    email: string;
    telefono: string;
    producto: string;
    cantidad: number;
}) => {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al registrar pedido');
    }

    return result.data;
};
