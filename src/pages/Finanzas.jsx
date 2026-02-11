/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */


import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    Download,
    Plus,
    Search,
    CreditCard,
    Briefcase,
    FileText,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const Finanzas = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, MOVIMIENTOS, NOMINA
    const [transactions, setTransactions] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });

    // Transaction Form
    const [isTransModalOpen, setIsTransModalOpen] = useState(false);
    const [transForm, setTransForm] = useState({
        tipo: 'EGRESO',
        categoria: 'INSUMOS',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        empresa: 'TODOTEJIDOS'
    });

    // Transaction Details
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Payroll Form & Bulk Mode
    const [payrollStep, setPayrollStep] = useState(1); // 1: Select, 2: Calculate, 3: Confirm
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedWorkersList, setSelectedWorkersList] = useState([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [payrollData, setPayrollData] = useState({
        periodo_inicio: '',
        periodo_fin: '',
        dias_laborados: 15,
        salario_base: 0,
        auxilio_transporte: 0,
        horas_extras: 0,
        bonificaciones: 0,
        deducciones: 0
    });

    useEffect(() => {
        fetchTransactions();
        fetchWorkers();
    }, []);

    // --- Fetchers ---
    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('finanzas')
            .select('*')
            .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            toast.error('Error cargando finanzas');
        } else {
            setTransactions(data);
            calculateBalance(data);
        }
        setLoading(false);
    };

    const fetchWorkers = async () => {
        const { data } = await supabase.from('operarios').select('*');
        if (data) setWorkers(data);
    };

    const calculateBalance = (data) => {
        const income = data.filter(t => t.tipo === 'INGRESO').reduce((acc, curr) => acc + Number(curr.monto), 0);
        const expense = data.filter(t => t.tipo === 'EGRESO').reduce((acc, curr) => acc + Number(curr.monto), 0);
        setBalance({ income, expense, total: income - expense });
    };

    // --- Transaction Handlers ---
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('finanzas').insert([transForm]);
            if (error) throw error;
            toast.success('Transacción registrada');
            setIsTransModalOpen(false);
            fetchTransactions();
            setTransForm({ tipo: 'EGRESO', categoria: 'INSUMOS', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0], empresa: 'TODOTEJIDOS' });
        } catch (err) {
            toast.error('Error al guardar: ' + err.message);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm('¿Eliminar registro?')) return;
        await supabase.from('finanzas').delete().eq('id', id);
        fetchTransactions();
    };

    const handleDownloadReceipt = (t) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('COMPROBANTE DE MOVIMIENTO', 105, 30, { align: 'center' });
        doc.setFontSize(12);
        doc.text('TODOTEJIDOS SAS', 105, 40, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`ID Transacción: ${t.id}`, 20, 60);
        doc.text(`Fecha: ${t.fecha}`, 20, 66);
        doc.text(`Tipo: ${t.tipo}`, 20, 72);
        doc.text(`Empresa: ${t.empresa || 'TODOTEJIDOS'}`, 20, 78);

        autoTable(doc, {
            startY: 90,
            head: [['Descripción', 'Categoría', 'Monto']],
            body: [[t.descripcion || 'Sin descripción', t.categoria, `$ ${Number(t.monto).toLocaleString()}`]],
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40] }
        });

        const finalY = doc.lastAutoTable.finalY + 40;
        doc.line(20, finalY, 100, finalY);
        doc.text('Firma Autorizada', 20, finalY + 5);

        doc.save(`Recibo_${t.tipo}_${t.fecha}.pdf`);
    };

    const handleExportReport = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Movimientos');

            worksheet.columns = [
                { header: 'FECHA', key: 'fecha', width: 15 },
                { header: 'TIPO', key: 'tipo', width: 12 },
                { header: 'CATEGORÍA', key: 'categoria', width: 20 },
                { header: 'DESCRIPCIÓN', key: 'descripcion', width: 40 },
                { header: 'MONTO', key: 'monto', width: 15 },
                { header: 'EMPRESA', key: 'empresa', width: 15 }
            ];

            // Add data
            transactions.forEach(t => {
                worksheet.addRow({
                    fecha: t.fecha,
                    tipo: t.tipo,
                    categoria: t.categoria,
                    descripcion: t.descripcion,
                    monto: t.monto,
                    empresa: t.empresa || 'TODOTEJIDOS'
                });
            });

            // Styling
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEEEEEE' }
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Reporte_Financiero_${new Date().toISOString().split('T')[0]}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

            toast.success('Reporte exportado correctamente');
        } catch (err) {
            toast.error('Error al exportar: ' + err.message);
        }
    };

    // --- Payroll Logic ---
    const startPayroll = (worker) => {
        setSelectedWorker(worker);
        // Estimate Salary based on role (Mock logic, can be improved with DB fields)
        // const baseSalaries = { 'Tapicero': 1800000, 'Costurero': 1500000, 'Ayudante': 1300000 };
        // const base = baseSalaries[worker.cargo] || 1300000;
        const base = Number(worker.salario_base) || 1300000;
        const auxilio = Number(worker.auxilio_transporte) || 162000;

        // Default period: Last 15 days
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const midDay = new Date(today.getFullYear(), today.getMonth(), 15);
        const isSecondBiw = today.getDate() > 15;

        setPayrollData({
            periodo_inicio: isSecondBiw ? midDay.toISOString().split('T')[0] : firstDay.toISOString().split('T')[0],
            periodo_fin: today.toISOString().split('T')[0],
            dias_laborados: 15,
            salario_base: base,
            auxilio_transporte: auxilio, // Auxilio legal 2024 approx
            horas_extras: 0,
            bonificaciones: 0,
            deducciones: 0
        });
        setPayrollStep(2);
    };

    const calculatePayrollTotal = () => {
        const salaryPerDay = payrollData.salario_base / 30;
        const subtotalSalary = salaryPerDay * payrollData.dias_laborados;
        const transport = (payrollData.auxilio_transporte / 30) * payrollData.dias_laborados;
        return subtotalSalary + transport + Number(payrollData.horas_extras) + Number(payrollData.bonificaciones) - Number(payrollData.deducciones);
    };

    const generatePayslipPDF = (record) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('TODOTEJIDOS SAS', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('COMPROBANTE DE PAGO DE NÓMINA', 105, 30, { align: 'center' });

        // Info
        doc.setFontSize(10);
        doc.text(`Empleado: ${record.nombre_empleado}`, 20, 50);
        doc.text(`Periodo: ${record.periodo_inicio} - ${record.periodo_fin}`, 20, 56);
        doc.text(`Fecha de Pago: ${record.fecha_pago}`, 150, 50);

        // Table
        const rows = [
            ['Salario Básico', `$ ${Number(record.salario_base).toLocaleString()}`],
            ['Días Laborados', record.dias_laborados],
            ['Auxilio Transporte', `$ ${Number(record.auxilio_transporte).toLocaleString()}`],
            ['Horas Extras', `$ ${Number(record.horas_extras).toLocaleString()}`],
            ['Bonificaciones', `$ ${Number(record.bonificaciones).toLocaleString()}`],
            ['Deducciones', `-$ ${Number(record.deducciones).toLocaleString()}`],
        ];

        autoTable(doc, {
            startY: 70,
            head: [['Concepto', 'Valor']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [40, 40, 40] }
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`NETO A PAGAR: $ ${Number(record.total_pagado).toLocaleString()}`, 105, finalY, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Recibí conforme a lo anterior:', 20, finalY + 40);
        doc.line(20, finalY + 55, 100, finalY + 55);
        doc.text('Firma del Empleado', 20, finalY + 60);

        doc.save(`Nomina_${record.nombre_empleado}_${record.fecha_pago}.pdf`);
    };

    const handleConfirmPayroll = async () => {
        const total = calculatePayrollTotal();
        const record = {
            empleado_id: selectedWorker.id,
            nombre_empleado: selectedWorker.nombre,
            empresa: selectedWorker.empresa || 'TODOTEJIDOS',
            ...payrollData,
            total_pagado: total,
            fecha_pago: new Date().toISOString().split('T')[0],
            estado: 'PAGADO'
        };

        try {
            // 1. Save to Nominas
            const { error: nomError } = await supabase.from('nominas').insert([record]);
            if (nomError) throw nomError;

            // 2. Save as Expense in Finanzas
            const expense = {
                tipo: 'EGRESO',
                categoria: 'NOMINA',
                monto: total,
                descripcion: `Pago Nómina: ${selectedWorker.nombre}`,
                fecha: new Date().toISOString().split('T')[0],
                referencia_id: selectedWorker.id,
                empresa: selectedWorker.empresa || 'TODOTEJIDOS'
            };
            await supabase.from('finanzas').insert([expense]);

            toast.success('Nómina guardada exitosamente');
            generatePayslipPDF(record);

            // Reset
            setPayrollStep(1);
            setSelectedWorker(null);
            fetchTransactions();

        } catch (err) {
            toast.error('Error al procesar nómina: ' + err.message);
        }
    };

    const handleConfirmPayrollBulk = async () => {
        setLoading(true);
        const date = new Date().toISOString().split('T')[0];

        try {
            for (const worker of selectedWorkersList) {
                const base = Number(worker.salario_base) || 1300000;
                const auxTotal = Number(worker.auxilio_transporte) || 162000;

                const aux = auxTotal / 2;
                const total = (base / 2) + aux;

                const record = {
                    empleado_id: worker.id,
                    nombre_empleado: worker.nombre,
                    empresa: worker.empresa || 'TODOTEJIDOS',
                    periodo_inicio: date,
                    periodo_fin: date,
                    dias_laborados: 15,
                    salario_base: base / 2,
                    auxilio_transporte: aux,
                    horas_extras: 0,
                    bonificaciones: 0,
                    deducciones: 0,
                    total_pagado: total,
                    fecha_pago: date,
                    estado: 'PAGADO'
                };

                await supabase.from('nominas').insert([record]);
                const expense = {
                    tipo: 'EGRESO',
                    categoria: 'NOMINA',
                    monto: total,
                    descripcion: `Nómina Masiva: ${worker.nombre}`,
                    fecha: date,
                    referencia_id: worker.id,
                    empresa: worker.empresa || 'TODOTEJIDOS'
                };
                await supabase.from('finanzas').insert([expense]);
            }

            toast.success(`${selectedWorkersList.length} Nóminas procesadas con éxito`);
            setPayrollStep(1);
            setSelectedWorkersList([]);
            setIsBulkMode(false);
            fetchTransactions();
        } catch (err) {
            toast.error('Error en proceso masivo: ' + err.message);
        }
        setLoading(false);
    };

    const toggleWorkerSelection = (worker) => {
        if (selectedWorkersList.find(w => w.id === worker.id)) {
            setSelectedWorkersList(prev => prev.filter(w => w.id !== worker.id));
        } else {
            setSelectedWorkersList(prev => [...prev, worker]);
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen pb-32 bg-[var(--bg-main)] transition-colors duration-300">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] sticky top-0 z-40 px-6 py-8">
                <div className="max-w-[98%] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/10">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Contador</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)]">
                        <div className="flex items-center gap-3 mb-2 text-emerald-500">
                            <TrendingUp size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ingresos (Mes)</span>
                        </div>
                        <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
                            $ {balance.income.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)]">
                        <div className="flex items-center gap-3 mb-2 text-red-500">
                            <TrendingDown size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Egresos (Mes)</span>
                        </div>
                        <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
                            $ {balance.expense.toLocaleString()}
                        </h3>
                    </div>
                    <div className={`bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)] ${balance.total >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                        <div className="flex items-center gap-3 mb-2 text-blue-500">
                            <CreditCard size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Balance Neto</span>
                        </div>
                        <h3 className={`text-3xl font-black tracking-tight ${balance.total >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            $ {balance.total.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['DASHBOARD', 'NOMINA'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                        >
                            {tab === 'DASHBOARD' ? 'Movimientos' : 'Pago de Nómina'}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                {activeTab === 'DASHBOARD' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight italic">Movimientos</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportReport}
                                    className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-ui)] text-[var(--text-main)] rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-[var(--bg-input)] transition-all"
                                >
                                    <Download size={16} /> Exportar
                                </button>
                                <button
                                    onClick={() => setIsTransModalOpen(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Plus size={16} /> Nueva Transacción
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {transactions.map(t => (
                                <div key={t.id} className="bg-[var(--bg-card)] p-5 rounded-[2rem] border border-[var(--border-ui)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${t.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {t.tipo === 'INGRESO' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[var(--text-main)] uppercase text-xs tracking-tight">{t.descripcion || 'Sin descripción'}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-input)] px-2 py-0.5 rounded-lg">{t.categoria}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.empresa === 'EMADERA' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                    {t.empresa || 'TODOTEJIDOS'}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-60">{t.fecha}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <button
                                            onClick={() => {
                                                setSelectedTransaction(t);
                                                setIsDetailModalOpen(true);
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                            title="Ver Detalles"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadReceipt(t)}
                                            className="p-2 text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                            title="Descargar Comprobante"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'NOMINA' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        {payrollStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-ui)]">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBulkMode ? 'bg-blue-600 text-white' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">Generación Masiva</p>
                                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Procesa pagos en lote</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsBulkMode(!isBulkMode);
                                            setSelectedWorkersList([]);
                                        }}
                                        className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-tighter transition-all ${isBulkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}
                                    >
                                        {isBulkMode ? 'Modo Masivo: ON' : 'Activar Selección'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {workers.map(w => {
                                        const isSelected = selectedWorkersList.find(sw => sw.id === w.id);
                                        return (
                                            <button
                                                key={w.id}
                                                onClick={() => isBulkMode ? toggleWorkerSelection(w) : startPayroll(w)}
                                                className={`bg-[var(--bg-card)] p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden ${isSelected ? 'border-blue-500 bg-blue-50/10 dark:bg-blue-900/10 ring-2 ring-blue-500/20' : 'border-[var(--border-ui)] hover:border-blue-500/50'}`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in">
                                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                                            <Plus size={14} className="rotate-45" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'}`}>
                                                        {w.nombre.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-[var(--text-main)] uppercase text-sm">{w.nombre}</h3>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{w.cargo}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                                    {isBulkMode ? (isSelected ? 'Seleccionado' : 'Seleccionar') : 'Generar Pago'} <ChevronRight size={14} />
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {isBulkMode && selectedWorkersList.length > 0 && (
                                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
                                        <button
                                            onClick={handleConfirmPayrollBulk}
                                            disabled={loading}
                                            className="px-12 py-5 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all group border border-white/10"
                                        >
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-xl text-white group-hover:rotate-12 transition-transform">
                                                <Briefcase size={16} />
                                            </div>
                                            {loading ? 'Procesando...' : `Confirmar Pago para ${selectedWorkersList.length} Operarios`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {payrollStep === 2 && selectedWorker && (
                            <div className="max-w-2xl mx-auto bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-ui)] shadow-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <button onClick={() => setPayrollStep(1)} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-all">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-black text-[var(--text-main)] uppercase italic">Liquidación de Nómina</h2>
                                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">{selectedWorker.nombre} • {selectedWorker.cargo}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Días Laborados" value={payrollData.dias_laborados} onChange={v => setPayrollData({ ...payrollData, dias_laborados: v })} type="number" />
                                        <InputGroup label="Salario Base" value={payrollData.salario_base} onChange={v => setPayrollData({ ...payrollData, salario_base: v })} type="number" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Aux. Transporte" value={payrollData.auxilio_transporte} onChange={v => setPayrollData({ ...payrollData, auxilio_transporte: v })} type="number" />
                                        <InputGroup label="Horas Extras" value={payrollData.horas_extras} onChange={v => setPayrollData({ ...payrollData, horas_extras: v })} type="number" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Bonificaciones" value={payrollData.bonificaciones} onChange={v => setPayrollData({ ...payrollData, bonificaciones: v })} type="number" />
                                        <InputGroup label="Deducciones" value={payrollData.deducciones} onChange={v => setPayrollData({ ...payrollData, deducciones: v })} type="number" />
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-[var(--border-ui)]">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Total a Pagar</span>
                                            <span className="text-4xl font-black text-[var(--text-main)] tracking-tighter">
                                                $ {calculatePayrollTotal().toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleConfirmPayroll}
                                            className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3"
                                        >
                                            <FileText size={20} /> Confirmar & Generar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Detalles */}
            {isDetailModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-[2.5rem] p-8 animate-in zoom-in-95 border border-[var(--border-ui)]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Detalles del Movimiento</h2>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">ID: {selectedTransaction.id}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase ${selectedTransaction.tipo === 'INGRESO' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {selectedTransaction.tipo}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[var(--border-ui)]">
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Monto Actual</p>
                                    <p className={`text-2xl font-black ${selectedTransaction.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        $ {Number(selectedTransaction.monto).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Fecha de Registro</p>
                                    <p className="text-lg font-black text-[var(--text-main)] italic">{selectedTransaction.fecha}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Categoría</p>
                                    <p className="text-[11px] font-black text-[var(--text-main)] uppercase bg-[var(--bg-input)] px-3 py-1.5 rounded-xl border border-[var(--border-ui)] w-fit">
                                        {selectedTransaction.categoria}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Empresa</p>
                                    <p className="text-[11px] font-black text-white uppercase bg-blue-600 px-3 py-1.5 rounded-xl shadow-md w-fit">
                                        {selectedTransaction.empresa || 'TODOTEJIDOS'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Descripción Completa</p>
                                <div className="p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border-ui)] italic min-h-[80px]">
                                    <p className="text-sm font-medium text-[var(--text-main)]">
                                        {selectedTransaction.descripcion || 'Sin descripción detallada disponible.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsDetailModalOpen(false)} className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl uppercase text-[10px] border border-[var(--border-ui)]">Cerrar</button>
                            <button
                                onClick={() => handleDownloadReceipt(selectedTransaction)}
                                className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                                <Download size={14} /> PDF Comprobante
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva Transacción */}
            {isTransModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95 border border-[var(--border-ui)]">
                        <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight mb-6">Registrar Movimiento</h2>
                        <form onSubmit={handleSaveTransaction} className="space-y-4">
                            <div className="flex gap-2 mb-4">
                                {['INGRESO', 'EGRESO'].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setTransForm({ ...transForm, tipo: type })}
                                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase ${transForm.tipo === type ? (type === 'INGRESO' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <InputGroup label="Monto" type="number" value={transForm.monto} onChange={v => setTransForm({ ...transForm, monto: v })} required />
                            <InputGroup label="Descripción" value={transForm.descripcion} onChange={v => setTransForm({ ...transForm, descripcion: v })} required />

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Categoría</label>
                                <select
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none"
                                    value={transForm.categoria}
                                    onChange={e => setTransForm({ ...transForm, categoria: e.target.value })}
                                >
                                    <option value="VENTA">Venta</option>
                                    <option value="INSUMOS">Insumos</option>
                                    <option value="SERVICIOS">Servicios</option>
                                    <option value="NOMINA">Nómina</option>
                                    <option value="VARIOS">Varios</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Empresa</label>
                                <select
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none"
                                    value={transForm.empresa}
                                    onChange={e => setTransForm({ ...transForm, empresa: e.target.value })}
                                >
                                    <option value="TODOTEJIDOS">TODOTEJIDOS</option>
                                    <option value="EMADERA">EMADERA</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsTransModalOpen(false)} className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl uppercase text-[10px] border border-[var(--border-ui)]">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] border border-[var(--border-ui)]">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ label, value, onChange, type = 'text', required = false }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all"
            required={required}
        />
    </div>
);

// Helper Icon
const ChevronLeft = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;

export default Finanzas;
