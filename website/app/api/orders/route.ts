import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API SECURE ENDPOINT para registrar pedidos
 * Aquí es donde se aplican las reglas de negocio y validaciones
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orden_compra, cliente, email, telefono, producto, cantidad } = body

        // 1. Validaciones de Seguridad
        if (!email || !telefono || !cliente) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
        }

        // 2. Insertar en Supabase usando el cliente de servidor
        const { data, error } = await supabase
            .from('pedidos')
            .insert([{
                orden_compra,
                cliente: cliente.toUpperCase(),
                email_cliente: email,
                telefono_cliente: telefono,
                producto: producto.toUpperCase(),
                cantidad,
                fuente: 'WEB',
                estado: 'PENDIENTE',
                fecha_ingreso: new Date().toISOString().split('T')[0]
            }])

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Error en API Orders:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
