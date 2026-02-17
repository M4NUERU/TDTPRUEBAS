/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProduction } from '../hooks/useProduction';
import { useWorkers } from '../hooks/useWorkers';
import { useOrders } from '../hooks/useOrders';
import { Factory, RefreshCw, Upload, Download, Search, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WorkerCard } from '../components/features/planta/WorkerCard';
import { AssignmentModal } from '../components/features/planta/AssignmentModal';
import { QualityModal } from '../components/features/planta/QualityModal';
import { exportDailyPlanToExcel } from '../utils/excelExport';
import { parseExcelPlanTrabajo } from '../utils/excelParser';
import { upsertPedidos } from '../api/orderService';
import { toast } from 'sonner';
// Note: parseDailyPlanExcel logic is complex and might need its own hook or util refactor later, keeping import for now if needed or moving to a utility button logic

const Produccion = () => {
    // Auth
    const user = useAuthStore((state) => state.user);
    const userRole = user?.rol?.toUpperCase();
    const isOperario = userRole === 'OPERARIO';
    const canManagePlanta = userRole === 'ADMIN' || userRole === 'SUPERVISOR';

    // State
    const [view, setView] = useState('EN_PROCESO'); // EN_PROCESO, PENDIENTE, HISTORIAL
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Hooks
    const { assignments, loading: prodLoading, fetchAssignments, assignOrder, removeAssignment, updateProgress } = useProduction(selectedDate);
    const { workers, loading: workersLoading } = useWorkers();
    const { orders: pendingOrders, loading: ordersLoading, fetchOrders } = useOrders('PENDIENTE');

    // UI State
    const [activeWorker, setActiveWorker] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showQualityModal, setShowQualityModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [historySearch, setHistorySearch] = useState('');

    const handleAssignClick = (worker) => {
        setActiveWorker(worker);
        fetchOrders(); // Ensure freshest orders
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (order, worker) => {
        const success = await assignOrder(order.id, worker.id, order.cantidad);
        if (success) setShowAssignModal(false);
    };

    const handleRefresh = () => {
        fetchAssignments();
        fetchOrders();
    };

    const handleQualityOpen = (assignment) => {
        setSelectedAssignment(assignment);
        setShowQualityModal(true);
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset state for loading
        try {
            // Fetch default client from config
            const { data: configData } = await supabase
                .from('erp_config')
                .select('value')
                .eq('key', 'cliente_predeterminado')
                .single();

            const defaultClient = configData?.value || 'TODOTEJIDOS';

            toast.loading('Procesando archivo masivo...', { id: 'import-excel' });

            const parsedOrders = await parseExcelPlanTrabajo(file, defaultClient);
            const { error } = await upsertPedidos(parsedOrders);

            if (error) throw error;

            toast.success(`${parsedOrders.length} pedidos procesados y sincronizados`, { id: 'import-excel' });
            fetchOrders(); // Refresh pending list
        } catch (err) {
            console.error('Error importando Excel:', err);
            toast.error('Error al procesar el archivo: ' + err.message, { id: 'import-excel' });
        } finally {
            e.target.value = ''; // Reset input
        }
    };

    const handleSaveQuality = async (id, qualityData) => {
        try {
            // Update assignment with quality data
            await updateProgress(selectedAssignment, 0, qualityData);
            setShowQualityModal(false);
            toast.success('Control de calidad registrado');
        } catch (err) {
            toast.error('Error al guardar calidad: ' + err.message);
        }
    };

    // Filter workers for current view logic
    const displayedWorkers = workers.filter(w => !isOperario || w.nombre.toUpperCase() === user.nombre?.toUpperCase());

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-4 py-6 sticky top-0 z-30">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Factory size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase dark:text-white italic text-blue-600">PRODUCCIÓN</h1>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {canManagePlanta && (
                            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl">
                                <Button
                                    variant={view === 'EN_PROCESO' ? 'white' : 'ghost'}
                                    onClick={() => setView('EN_PROCESO')}
                                    className={view === 'EN_PROCESO' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : ''}
                                    size="sm"
                                >
                                    PLAN HOY
                                </Button>
                                <Button
                                    variant={view === 'PENDIENTE' ? 'white' : 'ghost'}
                                    onClick={() => setView('PENDIENTE')}
                                    className={view === 'PENDIENTE' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : ''}
                                    size="sm"
                                >
                                    PENDIENTES
                                </Button>
                                {/* Removed HISTORIAL for simplicity in this refactor, can re-add if crucial */}
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

                        <Button variant="ghost" onClick={handleRefresh} loading={prodLoading} size="icon">
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>

                {canManagePlanta && view === 'EN_PROCESO' && (
                    <div className="max-w-[98%] mx-auto mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={Download}
                                onClick={() => exportDailyPlanToExcel(assignments, selectedDate, workers)}
                            >
                                Exportar
                            </Button>

                            <label className="cursor-pointer">
                                <div className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-sm">
                                    <Upload size={14} /> Importar Plan
                                </div>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleImportExcel}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <main className="max-w-[98%] mx-auto p-4">
                {view === 'EN_PROCESO' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {displayedWorkers.map(worker => {
                            const workerAssignments = assignments.filter(a => a.operarios?.nombre === worker.nombre);
                            return (
                                <WorkerCard
                                    key={worker.id}
                                    worker={worker}
                                    assignments={workerAssignments}
                                    onAssign={handleAssignClick}
                                    onRemoveAssignment={removeAssignment}
                                    onUpdateProgress={updateProgress}
                                    onQualityOpen={handleQualityOpen}
                                    canManage={canManagePlanta}
                                />
                            );
                        })}
                    </div>
                )}

                {view === 'PENDIENTE' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {pendingOrders.map(p => (
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
            </main>

            <AssignmentModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                worker={activeWorker}
                date={selectedDate}
                orders={pendingOrders}
                onAssign={handleAssignSubmit}
            />

            {selectedAssignment && (
                <QualityModal
                    isOpen={showQualityModal}
                    onClose={() => setShowQualityModal(false)}
                    assignment={selectedAssignment}
                    onSave={handleSaveQuality}
                />
            )}
        </div>
    );
};

export default Produccion;
