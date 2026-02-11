/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import ExcelJS from 'exceljs';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

/**
 * Export selected configuration tables to Excel
 * @param {Object} options - { includeWorkers, includeClients, includeProducts }
 */
export const exportConfigToExcel = async (options) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TodoTejidos Manager';
    workbook.created = new Date();

    let hasData = false;

    try {
        if (options.includeWorkers) {
            const { data: workers, error } = await supabase.from('operarios').select('*').order('nombre');
            if (!error && workers.length > 0) {
                const sheet = workbook.addWorksheet('Equipo');
                setupSheet(sheet, ['Nombre', 'Cargo', 'PIN', 'Fecha Registro']);
                workers.forEach(w => {
                    sheet.addRow([w.nombre, w.cargo || 'N/A', w.pin || '****', new Date(w.created_at).toLocaleDateString()]);
                });
                hasData = true;
            }
        }

        if (options.includeClients) {
            const { data: clients, error } = await supabase.from('clientes').select('*').order('nombre');
            if (!error && clients.length > 0) {
                const sheet = workbook.addWorksheet('Clientes');
                setupSheet(sheet, ['Nombre', 'Fecha Registro']);
                clients.forEach(c => {
                    sheet.addRow([c.nombre, new Date(c.created_at).toLocaleDateString()]);
                });
                hasData = true;
            }
        }

        if (options.includeProducts) {
            const { data: products, error } = await supabase.from('productos').select('*').order('nombre');
            if (!error && products.length > 0) {
                const sheet = workbook.addWorksheet('Productos');
                setupSheet(sheet, ['Nombre', 'Fecha Registro']);
                products.forEach(p => {
                    sheet.addRow([p.nombre, new Date(p.created_at).toLocaleDateString()]);
                });
                hasData = true;
            }
        }

        if (!hasData) {
            toast.error('No hay datos para exportar en las selecciones realizadas.');
            return;
        }

        const buffer = await workbook.xlsx.writeBuffer();
        downloadFile(buffer, `Configuracion_TodoTejidos_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Catálogos exportados exitosamente');

    } catch (err) {
        console.error('Export Error:', err);
        toast.error('Error al generar el archivo Excel');
    }
};

/**
 * Export filtered orders to Excel
 * @param {Array} orders - List of orders to export
 */
export const exportOrdersToExcel = async (orders) => {
    if (!orders || orders.length === 0) {
        toast.error('No hay pedidos para exportar.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Historial Pedidos');

    setupSheet(sheet, [
        'Orden Compra', 'Cliente', 'Producto', 'Cantidad',
        'Ingreso', 'Estado', 'Prioridad',
        'Terminado', 'Despachado', 'Transportadora', 'Guía'
    ]);

    orders.forEach(o => {
        sheet.addRow([
            o.orden_compra,
            o.cliente,
            o.producto,
            o.cantidad,
            new Date(o.fecha_ingreso).toLocaleDateString(),
            o.estado,
            o.prioridad ? 'SI' : 'NO',
            o.fecha_terminado ? new Date(o.fecha_terminado).toLocaleString() : '-',
            o.fecha_despacho ? new Date(o.fecha_despacho).toLocaleDateString() : '-',
            o.transportadora || '-',
            o.guia_transporte || '-'
        ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile(buffer, `Historial_Pedidos_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Historial exportado exitosamente');
};

// Helper to style header
const setupSheet = (sheet, headers) => {
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate-800
    };
    sheet.columns.forEach(column => {
        column.width = 20;
    });
};

// Helper to download blob
const downloadFile = (buffer, filename) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
};

/**
 * Export daily plan assignments to Excel
 * @param {Array} assignments - List of assignments
 * @param {String} date - Date of the plan
 */
/**
 * Export daily plan assignments to Excel (Matrix Format)
 * Rows: Products
 * Columns: Workers
 * @param {Array} assignments - List of assignments
 * @param {String} date - Date of the plan
 * @param {Array} workers - List of all workers
 */
export const exportDailyPlanToExcel = async (assignments, date, workers) => {
    if (!assignments || assignments.length === 0) {
        toast.error('No hay asignaciones para exportar en esta fecha.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Plan del Día');

    // 1. Prepare Data
    // Unique Products
    const productsMap = {}; // { productName: { total: 0, workers: { workerId: count } } }

    assignments.forEach(a => {
        const prodName = a.pedidos?.producto || 'Producto Desconocido';
        const workerId = a.operario_id;

        if (!productsMap[prodName]) {
            productsMap[prodName] = { total: 0, workers: {} };
        }

        productsMap[prodName].total += a.unidades_totales;

        if (workerId) {
            productsMap[prodName].workers[workerId] = (productsMap[prodName].workers[workerId] || 0) + a.unidades_totales;
        }
    });

    const productNames = Object.keys(productsMap).sort();

    // 2. Setup Headers
    // Col 1: Product Name, Col 2: Total, Col 3+: Workers
    const headers = [`PRODUCCION ${date}`, 'TOTAL'];
    workers.forEach(w => headers.push(w.nombre.toUpperCase()));

    const headerRow = sheet.addRow(headers);

    // Style Header
    headerRow.font = { bold: true, color: { argb: 'FF000000' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow background
    };

    // Borders
    headerRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // 3. Fill Rows
    productNames.forEach(pName => {
        const rowData = [pName, productsMap[pName].total];

        workers.forEach(w => {
            const count = productsMap[pName].workers[w.id];
            rowData.push(count || ''); // Empty string if 0 for cleaner look
        });

        const row = sheet.addRow(rowData);

        // Red color for Product Name if needed (mimicking the image style)
        row.getCell(1).font = { name: 'Arial', size: 10 };
        if (pName.includes('MP')) row.getCell(1).font.color = { argb: 'FFFF0000' };

        // Center align numbers
        row.eachCell((cell, colNumber) => {
            if (colNumber > 1) cell.alignment = { horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
    });

    // Adjust column widths
    sheet.getColumn(1).width = 50; // Product Name wide
    sheet.getColumn(2).width = 8;  // Total
    for (let i = 3; i <= headers.length; i++) {
        sheet.getColumn(i).width = 10;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile(buffer, `Plan_Produccion_${date}.xlsx`);
    toast.success('Plan exportado exitosamente');
};

/**
 * Exporta el inventario de insumos (Materiales)
 * Formato: Producto, Unidad, Cantidad, Observaciones
 */
export const exportInsumosExcel = async (items) => {
    if (!items || items.length === 0) {
        toast.error('No hay insumos para exportar.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventario Insumos');

    // Título Principal
    const titleRow = sheet.addRow(['INVENTARIO']);
    sheet.mergeCells('A1:D1');
    titleRow.getCell(1).alignment = { horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow
    };

    // Encabezados
    const headers = ['Producto', 'unidad de Medida', 'Cantidad', 'Observaciones'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' } // Light Gray
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Datos
    items.forEach(item => {
        const row = sheet.addRow([
            item.nombre,
            item.unidad_medida || 'Unidad',
            item.cantidad,
            item.observaciones || ''
        ]);
        row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            if (colNumber === 3) {
                cell.alignment = { horizontal: 'center' };
                if (item.cantidad === 0) cell.font = { color: { argb: 'FFFF0000' } }; // Red if 0
            }
        });
    });

    sheet.getColumn(1).width = 40;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 10;
    sheet.getColumn(4).width = 30;

    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile(buffer, `Inventario_Insumos_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Inventario exportado exitosamente');
};
