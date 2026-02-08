
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    // Payroll Form
    const [payrollStep, setPayrollStep] = useState(1); // 1: Select, 2: Calculate, 3: Confirm
    const [selectedWorker, setSelectedWorker] = useState(null);
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

    // --- Payroll Logic ---
    const startPayroll = (worker) => {
        setSelectedWorker(worker);
        // Estimate Salary based on role (Mock logic, can be improved with DB fields)
        const baseSalaries = { 'Tapicero': 1800000, 'Costurero': 1500000, 'Ayudante': 1300000 };
        const base = baseSalaries[worker.cargo] || 1300000;

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
            auxilio_transporte: 162000, // Auxilio legal 2024 approx
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
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tight">Transacciones Recientes</h2>
                            <button
                                onClick={() => setIsTransModalOpen(true)}
                                className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                            >
                                <Plus size={16} /> Nueva Transacción
                            </button>
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
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.empresa === 'EMADERA' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                                                    }`}>
                                                    {t.empresa || 'TODOTEJIDOS'}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-60">{t.fecha}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 pl-14 sm:pl-0">
                                        <span className={`text-lg font-black tracking-tight ${t.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {t.tipo === 'INGRESO' ? '+' : '-'} $ {Number(t.monto).toLocaleString()}
                                        </span>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {workers.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => startPayroll(w)}
                                        className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)] text-left hover:border-blue-500 hover:shadow-xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center font-black text-lg">
                                                {w.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[var(--text-main)] uppercase text-sm">{w.nombre}</h3>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{w.cargo}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            Generar Pago <ChevronRight size={14} />
                                        </div>
                                    </button>
                                ))}
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

            {/* Modal Nueva Transacción */}
            {isTransModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95">
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
                                <button type="button" onClick={() => setIsTransModalOpen(false)} className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl uppercase text-[10px]">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px]">Guardar</button>
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
