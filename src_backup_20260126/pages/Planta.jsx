import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
    Package, RefreshCw, X, Search, Plus, Minus, ArrowLeft,
    Calendar, UserPlus, CheckCircle2, Factory, Trash2, Clock, User,
    Download, Upload
} from 'lucide-react';
import { parseDailyPlanExcel } from '../utils/excelParser';
import { exportDailyPlanToExcel } from '../utils/excelExport';

const Planta = () => {
    // --- Auth & Permissions ---
    const user = JSON.parse(localStorage.getItem('todotejidos_user') || '{}');
    const isOperario = user.rol === 'OPERARIO';
    const canManagePlanta = user.rol === 'ADMIN' || user.rol === 'SUPERVISOR';

    // --- Core State ---
    const [pedidos, setPedidos] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('EN_PROCESO'); // EN_PROCESO (Plan Hoy), PENDIENTE (Bolsa)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // --- UI/Mobile State ---
    const [activeWorker, setActiveWorker] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignSearch, setAssignSearch] = useState('');
    const [workerViews, setWorkerViews] = useState({}); // { workerId: 'OC' | 'SUMMARY' }
    const [historyDates, setHistoryDates] = useState([]);
    const [historySearch, setHistorySearch] = useState('');

    const fetchHistoryDates = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('asignaciones')
            .select('fecha')
            .order('fecha', { ascending: false });

        if (!error && data) {
            const uniqueDates = [...new Set(data.map(item => item.fecha))];
            setHistoryDates(uniqueDates);
        }
        setLoading(false);
    };

    const fetchAssignments = useCallback(async () => {
        const { data, error } = await supabase
            .from('asignaciones')
            .select('*, pedidos(*), operarios(*)')
            .eq('fecha', selectedDate);
        if (!error) setAssignments(data || []);
    }, [selectedDate]);

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('estado', 'PENDIENTE')
            .order('prioridad', { ascending: false })
            .order('fecha_ingreso', { ascending: true });
        if (!error) setPedidos(data || []);
        setLoading(false);
    }, []);

    const fetchWorkers = async () => {
        const { data } = await supabase.from('operarios').select('*').order('nombre');
        setWorkers(data || []);
    };

    useEffect(() => {
        if (view === 'HISTORIAL') {
            fetchHistoryDates();
        } else {
            fetchAssignments();
            fetchPedidos();
            fetchWorkers();
        }
    }, [fetchAssignments, fetchPedidos, view]);

    // --- Actions ---
    const handleAssign = async (pedido, worker) => {
        try {
            const { error } = await supabase.from('asignaciones').insert([{
                pedido_id: pedido.id,
                operario_id: worker.id,
                fecha: selectedDate,
                estado: 'PENDIENTE',
                unidades_totales: pedido.cantidad,
                unidades_completadas: 0
            }]);
            if (error) throw error;
            toast.success(`OK: ${pedido.orden_compra} -> ${worker.nombre}`);
            fetchAssignments();
            setShowAssignModal(false);
        } catch (err) {
            toast.error('Ya está asignado o hubo un error');
        }
    };

    const handleRemoveAssignment = async (id) => {
        const { error } = await supabase.from('asignaciones').delete().eq('id', id);
        if (!error) {
            toast.success('Quitado del plan');
            fetchAssignments();
        }
    };

    const handleUpdateProgress = async (assignment, delta) => {
        const newCompleted = Math.max(0, Math.min(assignment.unidades_totales, assignment.unidades_completadas + delta));
        const isFinished = newCompleted === assignment.unidades_totales;

        const { error } = await supabase
            .from('asignaciones')
            .update({
                unidades_completadas: newCompleted,
                estado: isFinished ? 'TERMINADO' : 'PENDIENTE'
            })
            .eq('id', assignment.id);

        if (!error) {
            // Actualizar el estado del pedido global para que aparezca/desaparezca de Despacho
            const { error: pError } = await supabase.from('pedidos').update({
                estado: isFinished ? 'TERMINADO' : 'PENDIENTE',
                operario_asignado: assignment.operarios?.nombre,
                fecha_terminado: isFinished ? new Date().toISOString() : null
            }).eq('id', assignment.pedido_id);

            if (!pError) {
                if (isFinished) toast.success('¡Pedido terminado!');
                fetchAssignments();
            }
        }
    };

    const handleImportPlan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const instructions = await parseDailyPlanExcel(file);

            if (instructions.length === 0) {
                toast.error('No se encontraron instrucciones válidas');
                setLoading(false);
                return;
            }

            let successCount = 0;
            const errors = [];

            // 1. Obtener todos los pedidos pendientes (FIFO sort)
            const { data: globalPending } = await supabase
                .from('pedidos')
                .select('*')
                .eq('estado', 'PENDIENTE')
                .order('fecha_ingreso', { ascending: true });

            // Copia para ir consumiendo
            const availableOrders = [...(globalPending || [])];

            for (const item of instructions) {
                // { productName, workerName, quantity }

                // Buscar Trabajador (Match flexible)
                const worker = workers.find(w => w.nombre.toUpperCase().includes(item.workerName) || item.workerName.includes(w.nombre.toUpperCase()));

                if (!worker) {
                    errors.push(`Operario desconocido: ${item.workerName}`);
                    continue;
                }

                // Buscar pedidos disponibles de ese producto
                const matchingOrders = [];

                // NOTA: Para respetar FIFO (fecha_ingreso asc), debemos tomar los primeros que coincidan.
                let foundForThisItem = 0;
                for (let i = 0; i < availableOrders.length; i++) {
                    if (foundForThisItem >= item.quantity) break;

                    const order = availableOrders[i];
                    if (!order) continue;

                    // Match Producto Flexible
                    const pDb = (order.producto || '').toUpperCase().trim();
                    const pExcel = (item.productName || '').toUpperCase().trim();

                    if (pDb === pExcel || pDb.includes(pExcel) || pExcel.includes(pDb)) {
                        matchingOrders.push(order);
                        availableOrders[i] = null; // Marcar como usado
                        foundForThisItem++;
                    }
                }

                if (foundForThisItem < item.quantity) {
                    errors.push(`Faltan ${item.quantity - foundForThisItem} pedidos de ${item.productName} para ${item.workerName}`);
                }

                // Insertar en DB
                for (const order of matchingOrders) {
                    const { error } = await supabase.from('asignaciones').insert([{
                        pedido_id: order.id,
                        operario_id: worker.id,
                        fecha: selectedDate,
                        estado: 'PENDIENTE',
                        unidades_totales: order.cantidad,
                        unidades_completadas: 0
                    }]);
                    if (!error) successCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} asignaciones importadas`);
                fetchAssignments();
            }
            if (errors.length > 0) {
                console.warn('Errores:', errors);
                toast.warning(`Revisa consola: algunos items no se pudieron asignar completos.`);
            }

        } catch (err) {
            console.error(err);
            toast.error('Error al procesar el archivo');
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    // --- Render Helpers ---
    const assignedOrderIds = assignments.map(a => a.pedido_id);

    const filteredPedidos = pedidos.filter(p =>
        !assignedOrderIds.includes(p.id) && (
            (p.orden_compra?.toString() || '').includes(assignSearch) ||
            (p.producto?.toLowerCase() || '').includes(assignSearch.toLowerCase()) ||
            (p.cliente?.toLowerCase() || '').includes(assignSearch.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header Armonizado */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-4 py-6 sticky top-0 z-30">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Factory size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase dark:text-white">PLANTA</h1>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {canManagePlanta && (
                            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl">
                                <button onClick={() => setView('EN_PROCESO')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'EN_PROCESO' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-[var(--text-muted)]'}`}>PLAN HOY</button>
                                <button onClick={() => setView('PENDIENTE')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'PENDIENTE' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-[var(--text-muted)]'}`}>PENDIENTES</button>
                                <button onClick={() => setView('HISTORIAL')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'HISTORIAL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-[var(--text-muted)]'}`}>HISTORIAL</button>
                            </div>
                        )}
                        {isOperario && (
                            <div className="flex bg-blue-600 p-1 rounded-xl">
                                <span className="px-4 py-1.5 text-[9px] font-black uppercase text-white italic">Mi Registro de Producción</span>
                            </div>
                        )}

                        {canManagePlanta && (
                            <input
                                type="date"
                                className="bg-[var(--bg-input)] px-3 py-1.5 rounded-xl font-black text-[10px] text-[var(--text-main)] outline-none border border-transparent focus:border-blue-500"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        )}

                        <button onClick={() => { fetchAssignments(); fetchPedidos(); }} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-xl">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {canManagePlanta && (
                    <div className="max-w-[98%] mx-auto mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button onClick={() => exportDailyPlanToExcel(assignments, selectedDate, workers)} className="bg-[var(--bg-card)] border border-[var(--border-ui)] text-[var(--text-main)] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[var(--bg-input)] transition-all">
                                <Download size={14} /> Exportar
                            </button>
                            <div className="relative">
                                <input type="file" accept=".xlsx, .xls" onChange={handleImportPlan} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <button className="bg-slate-800 dark:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 shadow-lg">
                                    <Upload size={14} /> Importar Plan
                                </button>
                            </div>
                        </div>
                        {view === 'HISTORIAL' && (
                            <div className="relative w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                <input className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-input)] rounded-xl text-[9px] font-bold uppercase outline-none focus:border-blue-500 border border-transparent dark:text-white" placeholder="BUSCAR FECHA..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <main className="max-w-[98%] mx-auto p-4">
                {view === 'EN_PROCESO' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {workers.filter(w => !isOperario || w.nombre.toUpperCase() === user.nombre?.toUpperCase()).map(worker => {
                            const workerAssignments = assignments.filter(a => a.operarios?.nombre === worker.nombre);
                            if (!worker.nombre) return null;
                            const total = workerAssignments.reduce((acc, a) => acc + a.unidades_totales, 0);
                            const done = workerAssignments.reduce((acc, a) => acc + a.unidades_completadas, 0);

                            return (
                                <div key={worker.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-ui)] overflow-hidden shadow-sm flex flex-col hover:border-blue-400/50 transition-all">
                                    {/* Worker Header Compacto */}
                                    <div className="p-3 bg-[var(--bg-input)] flex justify-between items-center border-b border-[var(--border-ui)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                                <User size={16} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h2 className="text-[11px] font-black uppercase text-[var(--text-main)] leading-none">{worker.nombre}</h2>
                                                <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{worker.cargo || 'OPERARIO'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-blue-600">{done}/{total}</span>
                                            <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase">UND.</p>
                                        </div>
                                    </div>

                                    {/* Lista de Tareas Mini */}
                                    <div className="flex-1 p-2 space-y-1.5">
                                        {workerAssignments.length > 0 ? workerAssignments.map(a => (
                                            <div key={a.id} className={`p-2 rounded-xl border transition-all ${a.estado === 'TERMINADO' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-[var(--bg-card)] border-[var(--border-ui)]'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[7px] font-black text-blue-600 uppercase tracking-tighter">OC {a.pedidos?.orden_compra}</span>
                                                        <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase leading-tight line-clamp-1">{a.pedidos?.producto}</h3>
                                                    </div>
                                                    <button onClick={() => handleRemoveAssignment(a.id)} className="p-1 text-[var(--text-muted)] hover:text-red-500">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-1 items-center bg-[var(--bg-input)] p-0.5 rounded-lg">
                                                        <button onClick={() => handleUpdateProgress(a, -1)} className="p-1 text-[var(--text-muted)] hover:bg-white dark:hover:bg-slate-700 rounded-md"><Minus size={12} /></button>
                                                        <span className="text-[11px] font-black w-6 text-center dark:text-white">{a.unidades_completadas}</span>
                                                        <button onClick={() => handleUpdateProgress(a, 1)} className="p-1 text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-md"><Plus size={12} /></button>
                                                    </div>
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] italic">/ {a.unidades_totales}</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-4 text-center opacity-30">
                                                <Clock size={20} className="mx-auto mb-1" />
                                                <p className="text-[8px] font-black uppercase">Sin tareas</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer de Card con botón de asignar */}
                                    <button
                                        onClick={() => { setActiveWorker(worker); setShowAssignModal(true); setAssignSearch(''); }}
                                        className="w-full py-2 bg-[var(--bg-card)] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 text-[9px] font-black uppercase border-t border-[var(--border-ui)] flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Asignar Tarea
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {view === 'PENDIENTE' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {pedidos.map(p => (
                            <div key={p.id} className={`p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-ui)] shadow-sm relative overflow-hidden ${p.prioridad ? 'bg-red-50/10 border-red-200 dark:border-red-900/30' : ''}`}>
                                {p.prioridad && <div className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase">URGENTE</div>}
                                <div className="mb-2">
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter block">OC {p.orden_compra}</span>
                                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase leading-tight line-clamp-2">{p.producto}</h3>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase line-clamp-1">{p.cliente}</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-blue-600 leading-none">{p.cantidad}</span>
                                        <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">UND</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'HISTORIAL' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {historyDates.filter(d => d.includes(historySearch)).map(date => (
                            <button
                                key={date}
                                onClick={() => { setSelectedDate(date); setView('EN_PROCESO'); }}
                                className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-ui)] shadow-sm hover:border-blue-400 transition-all group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Calendar size={16} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-tighter">{date}</h3>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Asignación Pantalla Completa Moderno */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-2xl h-[80vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-[var(--border-ui)] flex items-center gap-4">
                            <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)]">
                                <ArrowLeft size={24} strokeWidth={3} />
                            </button>
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Asignar a {activeWorker?.nombre}</h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{selectedDate}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[var(--bg-input)]/50">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    autoFocus
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-2xl font-bold text-sm outline-none focus:border-blue-500 shadow-sm dark:text-white"
                                    placeholder="Buscar pedido..."
                                    value={assignSearch}
                                    onChange={e => setAssignSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredPedidos.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleAssign(p, activeWorker)}
                                    className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex justify-between items-center group"
                                >
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] font-black text-blue-600 uppercase">OC {p.orden_compra}</span>
                                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic">{p.fecha_ingreso}</span>
                                        </div>
                                        <h4 className="font-black text-[var(--text-main)] uppercase text-[11px] leading-tight mb-1 line-clamp-1">{p.producto}</h4>
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase">{p.cliente}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-2xl font-black text-blue-600 leading-none">{p.cantidad}</span>
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase">UND</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Planta;
