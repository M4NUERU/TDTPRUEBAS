import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 })
    }

    try {
        const { data, error } = await supabase
            .from('pedidos')
            .select('orden_compra, estado, producto, fecha_ingreso')
            .eq('orden_compra', id.toUpperCase())
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: {
                id: data.orden_compra,
                status: data.estado,
                product: data.producto,
                date: data.fecha_ingreso
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
