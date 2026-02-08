import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Fetch order
        const { data: order, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('id', id) // Or orden_compra if the param is OC
            .single()

        // Fallback: Check if param is orden_compra if id lookup fails or if format suggests OC
        if (error || !order) {
            const { data: orderOC, error: errorOC } = await supabase
                .from('pedidos')
                .select('*')
                .eq('orden_compra', id.toUpperCase())
                .single()

            if (errorOC || !orderOC) {
                return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
            }
            // Use orderOC
            return generatePDF(orderOC)
        }

        return generatePDF(order)

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

function generatePDF(order: any) {
    const doc = new jsPDF()

    // --- Header ---
    doc.setFontSize(22)
    doc.text('TODOTEJIDOS SAS', 150, 20, { align: 'right' })

    doc.setFontSize(10)
    doc.text('NIT: 900.123.456-7', 150, 26, { align: 'right' })
    doc.text('Calle 123 # 45-67, Bogotá', 150, 31, { align: 'right' })
    doc.text('facturacion@todotejidos.com', 150, 36, { align: 'right' })

    // --- Title ---
    doc.setFontSize(18)
    doc.setTextColor(30, 30, 30) // Dark Stone
    doc.text('FACTURA DE VENTA', 14, 25)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`No. ${order.orden_compra || order.id}`, 14, 32)
    doc.text(`Fecha: ${new Date(order.fecha_ingreso).toLocaleDateString()}`, 14, 37)

    // --- Customer Info ---
    doc.setDrawColor(200)
    doc.line(14, 45, 196, 45) // Divider

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Cliente:', 14, 55)

    doc.setFontSize(10)
    doc.text(order.cliente, 14, 62)
    doc.text(order.telefono_cliente || '', 14, 67)
    doc.text(order.email_cliente || '', 14, 72)
    doc.text(order.direccion_envio || order.ciudad || '', 14, 77)

    // --- Items Table ---
    const tableColumn = ["Descripción", "Cantidad", "Precio Unit.", "Total"]
    const tableRows = []

    // For now, assume 1 item based on 'producto' field, quantity 1 or parsed
    // If 'cantidad' exists in DB use it, else 1
    const quantity = order.cantidad || 1
    const price = order.total || 0

    tableRows.push([
        order.producto,
        quantity,
        `$ ${price.toLocaleString('es-CO')}`,
        `$ ${(price * quantity).toLocaleString('es-CO')}`
    ])

    // @ts-ignore
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: 'plain',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
    })

    // --- Totals ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(10)
    doc.text('Subtotal:', 140, finalY)
    doc.text(`$ ${(price * quantity).toLocaleString('es-CO')}`, 196, finalY, { align: 'right' })

    doc.text('IVA (19%):', 140, finalY + 5)
    doc.text('$ 0', 196, finalY + 5, { align: 'right' }) // Simplified for now if price is consolidated

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 140, finalY + 12)
    doc.text(`$ ${(price * quantity).toLocaleString('es-CO')}`, 196, finalY + 12, { align: 'right' })

    // --- Fuss ---
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150)
    doc.text('Esta factura se asimila en todos sus efectos a una letra de cambio.', 105, 280, { align: 'center' })
    doc.text('Gracias por su compra.', 105, 285, { align: 'center' })

    // Return PDF
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="factura-${order.orden_compra}.pdf"`
        }
    })
}
