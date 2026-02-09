import ExcelJS from 'exceljs';

/**
 * Deduce el cliente basado en el prefijo de la Orden de Compra
 */
const deduceCliente = (oc, defaultClient = 'CLIENTE OTROS') => {
    if (!oc) return defaultClient;
    const cleanOC = String(oc).trim().toUpperCase();

    if (cleanOC.startsWith('150')) return 'HOMECENTER';
    if (cleanOC.startsWith('350')) return 'FALABELLA';
    if (cleanOC.startsWith('TTJ')) return 'BYLMO';
    if (cleanOC.startsWith('EXITCO')) return 'EXITO';
    if (cleanOC.startsWith('LPD')) return 'LINIO';

    return defaultClient;
};

/**
 * Verifica si un color corresponde a la familia de VERDES
 */
const isGreen = (fgColor) => {
    if (!fgColor) return false;
    const a = (fgColor.argb || '').toUpperCase();

    // Lista de verdes conocidos en Excel
    const greens = [
        'FF00B050', 'FF92D050', 'FF00FF00', 'FF008000', 'FF32CD32',
        'FF70AD47', 'FF548235', 'FFC6EFCE', 'FF006100', 'FF339966'
    ];
    if (greens.includes(a) || a.endsWith('00B050') || a.endsWith('92D050')) return true;

    // Heurística: Si tiene mucho verde (G) y poco rojo/azul (R/B)
    if (a.startsWith('FF')) {
        const r = parseInt(a.slice(2, 4), 16);
        const g = parseInt(a.slice(4, 6), 16);
        const b = parseInt(a.slice(6, 8), 16);
        if (g > 160 && r < 190 && b < 190 && g > r && g > b) return true;
    }

    return false;
};

/**
 * Verifica si un color corresponde a la familia de AMARILLOS
 */
const isYellow = (fgColor) => {
    if (!fgColor) return false;
    const a = (fgColor.argb || '').toUpperCase();

    const yellows = ['FFFFFF00', 'FFFFC000', 'FFFFD700', 'FFFFE699', 'FFFFFFCC', 'FFFFFF99'];
    if (yellows.includes(a)) return true;

    // Heurística: R y G altos, B bajo
    if (a.startsWith('FF')) {
        const r = parseInt(a.slice(2, 4), 16);
        const g = parseInt(a.slice(4, 6), 16);
        const b = parseInt(a.slice(6, 8), 16);
        if (r > 200 && g > 200 && b < 150) return true;
    }

    return false;
};

/**
 * Extrae el valor de una celda de ExcelJS de forma robusta
 */
const getCellValue = (cell) => {
    if (!cell) return '';
    const val = cell.value;
    if (val === null || val === undefined) return '';

    // Si es un objeto (Fórmula, Rich Text, Fecha, etc)
    if (typeof val === 'object') {
        if (val instanceof Date) {
            // Formatear fecha para búsqueda de texto
            return `${val.getDate()}/${val.getMonth() + 1}/${val.getFullYear()}`;
        }
        if (val.result !== undefined) return String(val.result).trim();
        if (val.richText) return val.richText.map(rt => rt.text).join('').trim();
        if (val.text) return String(val.text).trim();
    }

    return String(val).trim();
};

export const parseExcelPlanTrabajo = async (file, defaultClient = 'CLIENTE OTROS') => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // ESTRATEGIA: Seleccionar la hoja que tenga más datos de OC (Columna 3)
    let bestSheet = null;
    let maxOCs = -1;

    workbook.worksheets.forEach(ws => {
        let ocCount = 0;
        // Muestreo rápido de las primeras 500 filas
        for (let i = 1; i <= 500; i++) {
            const val = getCellValue(ws.getRow(i).getCell(3));
            if (val && val.length >= 3) ocCount++;
        }
        if (ocCount > maxOCs) {
            maxOCs = ocCount;
            bestSheet = ws;
        }
    });

    const worksheet = bestSheet || workbook.worksheets[0];

    const COL_CLIENTE = 2;
    const COL_OC = 3;
    const COL_PRODUCTO = 4;
    const COL_TAPICERO = 7;
    const COL_FECHA_SALIDA = 10;
    const COL_TRANSPORTADORA = 11;

    const allRawData = [];
    const historicalOCs = new Set();
    const ROW_HISTORICAL_END = 6022;

    // Zona Histórica (1-6022)
    for (let i = 1; i <= ROW_HISTORICAL_END; i++) {
        const row = worksheet.getRow(i);
        const ocVal = getCellValue(row.getCell(COL_OC)).toUpperCase();
        if (!ocVal || ocVal.length < 3) continue;

        historicalOCs.add(ocVal);
        allRawData.push({
            orden_compra: ocVal,
            cliente: getCellValue(row.getCell(COL_CLIENTE)) || deduceCliente(ocVal, defaultClient),
            producto: getCellValue(row.getCell(COL_PRODUCTO)),
            cantidad: 1,
            estado: 'ENVIADO',
            prioridad: false,
            transportadora: getCellValue(row.getCell(COL_TRANSPORTADORA)) || 'ENVIA',
            operario_asignado: getCellValue(row.getCell(COL_TAPICERO)),
            fecha_ingreso: '2025-01-01',
            fecha_limite: getCellValue(row.getCell(COL_FECHA_SALIDA)),
            fecha_despacho: new Date().toISOString()
        });
    }

    // Zona de Trabajo (Hacia adelante con escaneo agresivo: 30k filas, 25 columnas)
    let emptyCount = 0;
    const MAX_SCAN = 30000;

    for (let i = ROW_HISTORICAL_END + 1; i <= MAX_SCAN; i++) {
        const row = worksheet.getRow(i);
        const ocCell = row.getCell(COL_OC);
        const ocVal = getCellValue(ocCell).toUpperCase();

        if (!ocVal || ocVal.length < 3) {
            emptyCount++;
            if (emptyCount > 150) break; // Más tolerante con espacios vacíos
            continue;
        }
        emptyCount = 0;

        // Evitar duplicados con el historial (visto como enviado)
        if (historicalOCs.has(ocVal)) continue;

        // Escaneo de 25 columnas buscando fecha pendiente
        let isPending = false;
        for (let col = 1; col <= 25; col++) {
            const val = getCellValue(row.getCell(col)).toUpperCase();
            // Patrones: 2026, /26, fechas de enero/febrero 2025 (typos)
            if (val.includes('2026') || val.includes('/26') ||
                ((val.includes('ENE') || val.includes('FEB')) && val.includes('2025'))) {
                isPending = true;
                break;
            }
        }

        let estado = isPending ? 'PENDIENTE' : 'ENVIADO';

        // Prioridad color verde
        const prodCell = row.getCell(COL_PRODUCTO);
        [ocCell, prodCell].forEach(cell => {
            if (cell && cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor) {
                if (isGreen(cell.fill.fgColor)) estado = 'ENVIADO';
            }
        });

        allRawData.push({
            orden_compra: ocVal,
            cliente: getCellValue(row.getCell(COL_CLIENTE)) || deduceCliente(ocVal, defaultClient),
            producto: getCellValue(prodCell),
            cantidad: 1,
            estado,
            prioridad: false,
            transportadora: getCellValue(row.getCell(COL_TRANSPORTADORA)) || 'ENVIA',
            operario_asignado: getCellValue(row.getCell(COL_TAPICERO)),
            fecha_ingreso: new Date().toISOString().split('T')[0],
            fecha_limite: getCellValue(row.getCell(COL_FECHA_SALIDA)),
            fecha_despacho: estado === 'ENVIADO' ? new Date().toISOString() : null
        });
    }

    // Consolidar pedidios por OC
    const groupedMap = new Map();
    allRawData.forEach(current => {
        const key = current.orden_compra;
        const existing = groupedMap.get(key);
        if (existing) {
            existing.cantidad += 1;
            if (current.producto && !existing.producto.includes(current.producto)) {
                existing.producto = `${existing.producto} / ${current.producto}`.slice(0, 500);
            }
            // Prioridad a ENVIADO: si alguna instancia está enviada, todo el pedido se considera enviado
            if (current.estado === 'ENVIADO') existing.estado = 'ENVIADO';
        } else {
            groupedMap.set(key, { ...current });
        }
    });

    return Array.from(groupedMap.values());
};

// --- EL PARSER DE INVENTARIO SE MANTIENE PERO CON EXCELJS PARA CONSISTENCIA ---
export const parseInventoryExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    let headerRowIndex = 1;
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
            const val = String(cell.value || '').toUpperCase();
            if (val.includes('MATERIAL') || val.includes('NOMBRE')) headerRowIndex = rowNumber;
        });
    });

    const headerRow = worksheet.getRow(headerRowIndex);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
        const val = String(cell.value || '').toUpperCase();
        if (val.includes('MATERIAL') || val.includes('NOMBRE')) colMap['NOMBRE'] = colNumber;
        if (val.includes('CANT')) colMap['CANTIDAD'] = colNumber;
        if (val.includes('MINIMO') || val.includes('STOCK')) colMap['MINIMO'] = colNumber;
    });

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowIndex) return;

        const nombreVal = colMap['NOMBRE'] ? String(row.getCell(colMap['NOMBRE']).value || '').trim().toUpperCase() : '';
        if (!nombreVal) return;

        const cantCell = colMap['CANTIDAD'] ? row.getCell(colMap['CANTIDAD']) : null;
        const cant = cantCell ? parseInt(cantCell.value?.result || cantCell.value || 0) : 0;

        const minCell = colMap['MINIMO'] ? row.getCell(colMap['MINIMO']) : null;
        const min = minCell ? parseInt(minCell.value?.result || minCell.value || 0) : 0;

        rows.push({
            nombre: nombreVal,
            cantidad: isNaN(cant) ? 0 : cant,
            unidad: 'Metros', // Default
            stock_minimo: isNaN(min) ? 10 : min
        });
    });

    return rows;
};

/**
 * Parsea un archivo Excel en formato MATRIZ para el Plan Diario
 * Fila 1: Encabezados (Col 1: Producto, Col 2: Total, Col 3+: Nombres Operarios)
 * Filas 2+: Productos
 * Celdas: Cantidad a asignar
 * 
 * Retorna: Array de instrucciones { productName, workerName, quantity }
 */
export const parseDailyPlanExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const instructions = [];

    // 1. Leer Encabezados para identificar operarios
    const headerRow = worksheet.getRow(1);
    const workerColumns = {}; // { colIndex: workerName }

    headerRow.eachCell((cell, colNumber) => {
        if (colNumber > 2) { // Asumimos que Cols 1 y 2 son Producto/Total
            const val = getCellValue(cell).toUpperCase();
            if (val && val !== 'TOTAL') {
                workerColumns[colNumber] = val;
            }
        }
    });

    // 2. Leer Filas de Productos
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const productName = getCellValue(row.getCell(1)).toUpperCase();
        if (!productName) return;

        // Iterar solo por columnas de operarios identificados
        Object.entries(workerColumns).forEach(([colStr, workerName]) => {
            const col = parseInt(colStr);
            const cellVal = row.getCell(col).value;

            // Flexibilidad para valor numérico
            let quantity = 0;
            if (typeof cellVal === 'number') quantity = cellVal;
            else if (cellVal && cellVal.result) quantity = Number(cellVal.result);
            else if (cellVal) quantity = parseInt(String(cellVal));

            if (quantity > 0) {
                instructions.push({
                    productName,
                    workerName,
                    quantity
                });
            }
        });
    });

    return instructions;
};

/**
 * Parsea un Excel de Inventario de Insumos (Materiales)
 * Formato esperado: Producto, unidad de Medida, Cantidad, Observaciones
 */
export const parseInsumosExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    let startRow = 1;
    // Buscar la fila que contiene "PRODUCTO"
    for (let i = 1; i <= 20; i++) {
        const row = worksheet.getRow(i);
        let found = false;
        row.eachCell(cell => {
            const val = getCellValue(cell).toUpperCase();
            if (val === 'PRODUCTO') found = true;
        });
        if (found) {
            startRow = i;
            break;
        }
    }

    const headerRow = worksheet.getRow(startRow);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
        const val = getCellValue(cell).toUpperCase();
        if (val.includes('PRODUCTO')) colMap.nombre = colNumber;
        if (val.includes('UNIDAD')) colMap.unidad = colNumber;
        if (val.includes('CANTIDAD')) colMap.cantidad = colNumber;
        if (val.includes('OBSERV')) colMap.observaciones = colNumber;
    });

    const results = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= startRow) return;

        const nombre = getCellValue(row.getCell(colMap.nombre || 1)).toUpperCase();
        if (!nombre || nombre === 'INVENTARIO') return;

        let cantidad = 0;
        const cantCell = row.getCell(colMap.cantidad || 3);
        if (typeof cantCell.value === 'number') cantidad = cantCell.value;
        else if (cantCell.value?.result) cantidad = Number(cantCell.value.result);
        else cantidad = parseFloat(getCellValue(cantCell).replace(',', '.')) || 0;

        results.push({
            nombre,
            unidad_medida: getCellValue(row.getCell(colMap.unidad || 2)),
            cantidad,
            observaciones: getCellValue(row.getCell(colMap.observaciones || 4))
        });
    });

    return results;
};
