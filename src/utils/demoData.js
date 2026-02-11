/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

export const DEMO_DATA = {
    usuarios: [
        { id: 'demo-admin-1', nombre: 'Admin Demo', pin: '1234', rol: 'ADMIN' },
        { id: 'demo-worker-1', nombre: 'Juan Operario', pin: '1111', rol: 'OPERARIO' },
        { id: 'demo-bodega-1', nombre: 'Carlos Bodega', pin: '2222', rol: 'BODEGUERO' }
    ],
    configuracion: [
        { id: 'global', horario_inicio: '07:30', horario_fin: '17:30', valor_hora_extra: 8500 }
    ],
    operarios: [
        { id: 'op1', nombre: 'JUAN PEREZ', rol: 'TAPICERO', activo: true, salario_base: 1300000 },
        { id: 'op2', nombre: 'MARIA LOPEZ', rol: 'COSTURERA', activo: true, salario_base: 1250000 },
        { id: 'op3', nombre: 'PEDRO GOMEZ', rol: 'AUXILIAR', activo: true, salario_base: 1160000 }
    ],
    inventario_insumos: [
        { id: 'ins1', nombre: 'TELA JACQUARD GRIS', codigo: 'TEL-001', categoria: 'TELAS', cantidad: 150, unidad_medida: 'METRO', stock_minimo: 20 },
        { id: 'ins2', nombre: 'ESPUMA D30 200x100x10', codigo: 'ESP-030', categoria: 'ESPUMAS', cantidad: 45, unidad_medida: 'UNIDAD', stock_minimo: 10 },
        { id: 'ins3', nombre: 'PATA MADERA CÓNICA', codigo: 'PAT-001', categoria: 'PATAS', cantidad: 500, unidad_medida: 'UNIDAD', stock_minimo: 100 },
        { id: 'ins4', nombre: 'PEGANTE INDUSTRIAL', codigo: 'INS-002', categoria: 'OTROS', cantidad: 12, unidad_medida: 'ROLLO', stock_minimo: 5 }
    ],
    catalogo_productos: [
        { id: 'prod1', nombre: 'SOFÁ CHESTER 3P', categoria: 'SOFAS', empresa: 'TODOTEJIDOS', precio_base: 1850000 },
        { id: 'prod2', nombre: 'BASECAMA MATRIMONIAL', categoria: 'BASECAMAS', empresa: 'EMADERA', precio_base: 450000 }
    ],
    recetas: [
        { id: 'rec1', producto_id: 'prod1', nombre_variante: 'LUJO GRIS', activo: true }
    ],
    recetas_insumos: [
        { receta_id: 'rec1', insumo_id: 'ins1', cantidad: 12, unidad_medida: 'METRO' },
        { receta_id: 'rec1', insumo_id: 'ins2', cantidad: 3, unidad_medida: 'UNIDAD' },
        { receta_id: 'rec1', insumo_id: 'ins3', cantidad: 4, unidad_medida: 'UNIDAD' }
    ],
    proveedores: [
        { id: 'prov1', razon_social: 'TEXTILES ANDINOS SAS', nit: '900.123.456-1', contacto_nombre: 'Andres G.', categoria_insumo: 'TELAS' },
        { id: 'prov2', razon_social: 'MADERAS DEL NORTE', nit: '800.555.444-2', contacto_nombre: 'Diana M.', categoria_insumo: 'MADERAS' }
    ],
    ordenes_compra: [
        { id: 'oc1', consecutivo: 1001, proveedor_id: 'prov1', empresa_solicitante: 'TODOTEJIDOS', estado: 'RECIBIDA', total_estimado: 5400000, created_at: '2026-02-01T10:00:00Z' },
        { id: 'oc2', consecutivo: 1002, proveedor_id: 'prov2', empresa_solicitante: 'EMADERA', estado: 'ENVIADA', total_estimado: 1250000, created_at: '2026-02-05T14:30:00Z' }
    ],
    ordenes_compra_detalles: [
        { id: 'det1', orden_id: 'oc1', insumo_id: 'ins1', cantidad_solicitada: 100, precio_unitario: 54000 }
    ],
    pedidos: [
        { id: 'ped1', oc: 'OC-5501', cliente: 'MUEBLES JAMAR', producto: 'SOFÁ CHESTER 3P', cantidad: 5, estado: 'PENDIENTE', prioridad: true, created_at: '2026-02-08T09:00:00Z' },
        { id: 'ped2', oc: 'OC-5502', cliente: 'TIENDAS ARA', producto: 'BASECAMA MATRIMONIAL', cantidad: 10, estado: 'ENVIADO', prioridad: false, created_at: '2026-02-09T11:00:00Z' }
    ],
    finanzas_transacciones: [
        { id: 't1', tipo: 'INGRESO', categoria: 'VENTA', monto: 1200000, descripcion: 'Abono Pedido Ara', fecha: '2026-02-09' },
        { id: 't2', tipo: 'EGRESO', categoria: 'MATERIALES', monto: 450000, descripcion: 'Pago Factura Textiles', fecha: '2026-02-10' }
    ]
};
