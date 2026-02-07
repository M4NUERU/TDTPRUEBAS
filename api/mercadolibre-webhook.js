import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Service Role needed for backend actions)
// VITE_ variables are usually for frontend, but we can reuse them if exposed, 
// though for backend we prefer standard names or specific backend keys.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ML_APP_ID = process.env.MERCADOLIBRE_APP_ID;
const ML_CLIENT_SECRET = process.env.MERCADOLIBRE_CLIENT_SECRET;

async function refreshMLToken(refreshToken) {
    try {
        const response = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: ML_APP_ID,
                client_secret: ML_CLIENT_SECRET,
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error refreshing token:', errorText);
            return null; // Return null on failure
        }

        return await response.json();
    } catch (error) {
        console.error('Network error refreshing token:', error);
        return null;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { topic, resource } = req.body;
    console.log('🔔 Webhook received:', { topic, resource });

    if (topic !== 'orders_v2') return res.status(200).send('OK');

    try {
        const orderId = resource.split('/').pop();

        // 1. Check for duplicate
        const { data: existing } = await supabase.from('pedidos').select('id').eq('orden_compra', orderId).single();
        if (existing) {
            console.log('Skipping duplicate order:', orderId);
            return res.status(200).send('OK');
        }

        // 2. Get Tokens
        const { data: dbTokens, error: dbError } = await supabase
            .from('integraciones')
            .select('*')
            .eq('id', 'MERCADOLIBRE')
            .single();

        if (dbError || !dbTokens) {
            console.error('❌ Missing MercadoLibre tokens in DB');
            return res.status(500).json({ error: 'System not configured' });
        }

        let accessToken = dbTokens.access_token;

        // 3. Fetch Order with Retry Logic
        let orderData = null;

        const fetchOrder = async (token) => {
            const res = await fetch(`https://api.mercadolibre.com/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) return null; // Token expired
            if (!res.ok) throw new Error(`ML API Error: ${res.statusText}`);
            return await res.json();
        };

        orderData = await fetchOrder(accessToken);

        // If fetch failed due to Auth, try refreshing
        if (!orderData) {
            console.log('🔄 Token expired, refreshing...');
            const newTokens = await refreshMLToken(dbTokens.refresh_token);

            if (!newTokens) {
                throw new Error('Could not refresh token. Manual re-auth required.');
            }

            // Update DB with new tokens
            await supabase.from('integraciones').update({
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token,
                expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
            }).eq('id', 'MERCADOLIBRE');

            // Retry fetch with new token
            accessToken = newTokens.access_token;
            orderData = await fetchOrder(accessToken);
        }

        if (!orderData) throw new Error('Failed to fetch order after refresh attempt');

        // 4. Save to Database
        const newPedido = {
            orden_compra: orderData.id.toString(),
            cliente: `${orderData.buyer.first_name} ${orderData.buyer.last_name}`.trim(),
            producto: orderData.order_items[0].item.title,
            cantidad: orderData.order_items[0].quantity,
            estado: 'PENDIENTE',
            fuente: 'MERCADOLIBRE',
            transportadora: 'MERCADO ENVIOS',
            telefono_cliente: orderData.buyer.phone?.number || '',
            fecha_ingreso: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('pedidos').insert([newPedido]);
        if (insertError) throw insertError;

        console.log('✅ Order imported:', orderId);
        return res.status(200).send('OK');

    } catch (error) {
        console.error('❌ Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
