import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Settings,
    Clock,
    DollarSign,
    Users,
    Save,
    RefreshCw,
    ShieldCheck,
    Briefcase,
    Building2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const Configuracion = () => {
    const [loading, setLoading] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [config, setConfig] = useState({
        hora_entrada_general: '07:00',
        hora_salida_general: '17:00',
        costo_hora_extra_diurna: 0,
        costo_hora_extra_nocturna: 0,
        cliente_predeterminado: 'TODOTEJIDOS'
    });
    const [schedules, setSchedules] = useState({});
    const [workerDetails, setWorkerDetails] = useState({});

    useEffect(() => {
        fetchConfigs();
        fetchWorkers();
    }, []);

    const fetchConfigs = async () => {
        try {
            const { data, error } = await supabase.from('erp_config').select('*');
            if (error) {
                console.warn('Tabla erp_config no encontrada o sin datos');
                return;
            }
            const configObj = {};
            data.forEach(item => {
                configObj[item.key] = item.value;
            });
            setConfig(prev => ({ ...prev, ...configObj }));
        } catch (err) {
            console.error('Error fetching config:', err);
        }
    };

    const fetchWorkers = async () => {
        try {
            const { data, error } = await supabase.from('operarios').select('*').order('nombre');
            if (error) throw error;
            setWorkers(data || []);

            // Initialize workerDetails with fetched data
            const detailsObj = {};
            data.forEach(w => {
                detailsObj[w.id] = {
                    salario_base: w.salario_base || 1300000,
                    auxilio_transporte: w.auxilio_transporte || 162000
                };
            });
            setWorkerDetails(detailsObj);

            // Fetch specific schedules
            const { data: schedData } = await supabase.from('horarios_personal').select('*');
            const schedObj = {};
            schedData?.forEach(s => {
                schedObj[s.worker_id] = s;
            });
            setSchedules(schedObj);
        } catch (err) {
            console.error('Error fetching workers/schedules:', err);
        }
    };

    const handleSaveGlobalConfig = async () => {
        setLoading(true);
        try {
            const promises = Object.entries(config).map(([key, value]) => {
                return supabase.from('erp_config').upsert({ key, value }, { onConflict: 'key' });
            });
            await Promise.all(promises);
            toast.success('Configuración global guardada');
        } catch (err) {
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkerDetails = async (workerId) => {
        const sched = schedules[workerId] || {
            hora_entrada: config.hora_entrada_general,
            hora_salida: config.hora_salida_general
        };
        const details = workerDetails[workerId] || { salario_base: 1300000, auxilio_transporte: 162000 };

        try {
            // Save Schedule
            const { error: schedError } = await supabase.from('horarios_personal').upsert({
                worker_id: workerId,
                hora_entrada: sched.hora_entrada,
                hora_salida: sched.hora_salida,
                updated_at: new Date().toISOString()
            }, { onConflict: 'worker_id' });

            if (schedError) throw schedError;

            // Save Salary Details to Operarios
            const { error: opError } = await supabase.from('operarios').update({
                salario_base: details.salario_base,
                auxilio_transporte: details.auxilio_transporte
            }).eq('id', workerId);

            if (opError) throw opError;

            toast.success('Datos del colaborador actualizados');
        } catch (err) {
            toast.error('Error al guardar datos: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen pb-32 bg-[var(--bg-main)]">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] sticky top-0 z-40 px-6 py-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl flex items-center justify-center">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Configuración ERP</h1>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Parámetros Operativos y Reglas de Negocio</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 space-y-12">

                {/* Sección 1: Parámetros Generales */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-indigo-500" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)]">Parámetros Globales</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-ui)] space-y-4">
                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest block">Horario General</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[8px] font-bold uppercase text-[var(--text-muted)] mb-1">Entrada</p>
                                    <input
                                        type="time"
                                        value={config.hora_entrada_general}
                                        onChange={e => setConfig({ ...config, hora_entrada_general: e.target.value })}
                                        className="w-full bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-ui)] text-sm font-black"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[8px] font-bold uppercase text-[var(--text-muted)] mb-1">Salida</p>
                                    <input
                                        type="time"
                                        value={config.hora_salida_general}
                                        onChange={e => setConfig({ ...config, hora_salida_general: e.target.value })}
                                        className="w-full bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-ui)] text-sm font-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-ui)] space-y-4">
                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest block">Clientes Default</label>
                            <div>
                                <p className="text-[8px] font-bold uppercase text-[var(--text-muted)] mb-1">Cliente Predeterminado</p>
                                <input
                                    type="text"
                                    value={config.cliente_predeterminado}
                                    onChange={e => setConfig({ ...config, cliente_predeterminado: e.target.value.toUpperCase() })}
                                    placeholder="Ej: TODOTEJIDOS"
                                    className="w-full bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-ui)] text-sm font-black uppercase"
                                />
                            </div>
                        </div>

                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-ui)] space-y-4">
                            <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest block">Costos de Tiempo</label>
                            <div>
                                <p className="text-[8px] font-bold uppercase text-[var(--text-muted)] mb-1">Valor Hora Extra Diurna</p>
                                <input
                                    type="number"
                                    value={config.costo_hora_extra_diurna}
                                    onChange={e => setConfig({ ...config, costo_hora_extra_diurna: parseFloat(e.target.value) })}
                                    className="w-full bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-ui)] text-sm font-black"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveGlobalConfig} loading={loading} icon={Save}>
                            GUARDAR CONFIGURACIÓN GLOBAL
                        </Button>
                    </div>
                </section>

                <hr className="border-[var(--border-ui)] opacity-30" />

                {/* Sección 2: Horarios y Salarios por Personal */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Users className="text-indigo-500" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)]">Gestión de Personal (Horarios y Salarios)</h2>
                    </div>

                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-ui)] overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[var(--bg-input)]/50 border-b border-[var(--border-ui)]">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Colaborador</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Cargo</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Salario Base</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Aux. Transp.</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Entrada</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Salida</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-ui)]">
                                {workers.map(worker => {
                                    const sched = schedules[worker.id] || {
                                        hora_entrada: config.hora_entrada_general,
                                        hora_salida: config.hora_salida_general
                                    };
                                    const details = workerDetails[worker.id] || { salario_base: 0, auxilio_transporte: 0 };

                                    return (
                                        <tr key={worker.id} className="hover:bg-[var(--bg-input)]/20 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                        {worker.nombre.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-black uppercase text-[var(--text-main)]">{worker.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{worker.cargo}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={details.salario_base}
                                                        onChange={e => setWorkerDetails({
                                                            ...workerDetails,
                                                            [worker.id]: { ...details, salario_base: parseFloat(e.target.value) }
                                                        })}
                                                        className="w-28 pl-5 bg-[var(--bg-input)] border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={details.auxilio_transporte}
                                                        onChange={e => setWorkerDetails({
                                                            ...workerDetails,
                                                            [worker.id]: { ...details, auxilio_transporte: parseFloat(e.target.value) }
                                                        })}
                                                        className="w-24 pl-5 bg-[var(--bg-input)] border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="time"
                                                    value={sched.hora_entrada}
                                                    onChange={e => setSchedules({
                                                        ...schedules,
                                                        [worker.id]: { ...sched, hora_entrada: e.target.value }
                                                    })}
                                                    className="bg-transparent border-none text-xs font-black focus:ring-0 w-20"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="time"
                                                    value={sched.hora_salida}
                                                    onChange={e => setSchedules({
                                                        ...schedules,
                                                        [worker.id]: { ...sched, hora_salida: e.target.value }
                                                    })}
                                                    className="bg-transparent border-none text-xs font-black focus:ring-0 w-20"
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSaveWorkerDetails(worker.id)}
                                                    className="opacity-0 group-hover:opacity-100 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                >
                                                    GUARDAR
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Configuracion;
