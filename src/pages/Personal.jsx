/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Clock, Calendar, FileText, CheckCircle, XCircle, Download, PenTool, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/logo.jpeg';
import PersonalAdmin from '../components/PersonalAdmin';
import { useAuthStore } from '../store/authStore';
import { useAdmin } from '../hooks/useAdmin';
import { UserTable } from '../components/features/admin/UserTable';
import { UserModal } from '../components/features/admin/UserModal';
import { Button } from '../components/ui/Button';
import { Users } from 'lucide-react';

const Personal = () => {
    const user = useAuthStore((state) => state.user);
    const [asistenciaHoy, setAsistenciaHoy] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [vales, setVales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showValeModal, setShowValeModal] = useState(false);

    // Vale Form State
    const [valeForm, setValeForm] = useState({
        cantidad_horas: '',
        motivo: '',
        tipo: 'CARGO' // Default to requesting time off
    });

    // Admin Logic
    const isSuperAdmin = user?.rol === 'ADMIN';
    const { users, loading: adminLoading, fetchUsers, saveUser, deleteUser, resetPassword } = useAdmin();
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleAddNewUser = () => {
        setEditingUser(null);
        setShowUserModal(true);
    };

    useEffect(() => {
        if (user) {
            fetchData(user.id);
        }
    }, [user]);

    const fetchData = async (userId) => {
        try {
            // 1. Asistencia de Hoy
            const today = new Date().toISOString().split('T')[0];
            const { data: ast } = await supabase
                .from('asistencia')
                .select('*')
                .eq('operario_id', userId)
                .eq('fecha', today)
                .single();
            setAsistenciaHoy(ast);

            // 2. Historial Reciente (Últimos 7)
            const { data: hist } = await supabase
                .from('asistencia')
                .select('*')
                .eq('operario_id', userId)
                .order('fecha', { ascending: false })
                .limit(7);
            setHistorial(hist || []);

            // 3. Vales
            const { data: v } = await supabase
                .from('vales_tiempo')
                .select('*')
                .eq('operario_id', userId)
                .order('created_at', { ascending: false });
            setVales(v || []);

        } catch (error) {
            console.error('Error fetching personal data:', error);
        }
    };

    const handleClockInOut = async () => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        try {
            if (!asistenciaHoy) {
                // MARCAR ENTRADA
                const { error } = await supabase
                    .from('asistencia')
                    .insert([{ operario_id: user.id, fecha: today, entrada: now }]);

                if (error) throw error;
                toast.success("¡Entrada registrada! Que tengas buen día.");
            } else if (!asistenciaHoy.salida) {
                // MARCAR SALIDA
                const nowTyped = new Date(now);
                const entrada = new Date(asistenciaHoy.entrada);
                const diffMs = nowTyped - entrada;
                const horasTotales = (diffMs / (1000 * 60 * 60)).toFixed(2);

                // Calculate Overtime (Extras)
                let horasExtras = 0;
                try {
                    const { data: schedule } = await supabase
                        .from('horarios_personal')
                        .select('hora_salida')
                        .eq('worker_id', user.id)
                        .single();

                    if (schedule) {
                        const [schedH, schedM] = schedule.hora_salida.split(':');
                        const scheduledSalida = new Date(nowTyped);
                        scheduledSalida.setHours(parseInt(schedH), parseInt(schedM), 0);

                        if (nowTyped > scheduledSalida) {
                            const extraMs = nowTyped - scheduledSalida;
                            horasExtras = Math.max(0, (extraMs / (1000 * 60 * 60))).toFixed(2);
                        }
                    }
                } catch (err) {
                    console.warn('No hay horario específico, no se calculan extras individualmente');
                }

                const { error } = await supabase
                    .from('asistencia')
                    .update({
                        salida: now,
                        horas_trabajadas: horasTotales,
                        horas_extras: horasExtras
                    })
                    .eq('id', asistenciaHoy.id);

                if (error) throw error;
                toast.success(`Salida registrada. Trabajaste ${horasTotales}h (Extras: ${horasExtras}h)`);
            }
            await fetchData(user.id);
        } catch (error) {
            toast.error('Error al registrar asistencia');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const solicitarVale = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const { error } = await supabase.from('vales_tiempo').insert([{
                operario_id: user.id,
                cantidad_horas: valeForm.cantidad_horas,
                tipo: 'CARGO', // Solicitud de permiso por defecto
                motivo: valeForm.motivo,
                estado: 'PENDIENTE'
            }]);

            if (error) throw error;
            toast.success('Solicitud enviada correctamente');
            setShowValeModal(false);
            setValeForm({ cantidad_horas: '', motivo: '', tipo: 'CARGO' });
            fetchData(user.id);
        } catch (error) {
            toast.error('Error al solicitar vale');
        }
    };

    const generarPDF = (vale) => {
        const doc = new jsPDF();

        // Logo (if loaded properly)
        try {
            doc.addImage(logo, 'JPEG', 15, 15, 40, 40);
        } catch (err) {
            console.warn("Logo not loaded", err);
        }

        // Header
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("VALE DE TIEMPO / PERMISO", 70, 30);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("TodoTejidos SAS", 70, 40);
        doc.text(`Fecha de Emisión: ${new Date(vale.created_at).toLocaleDateString()}`, 70, 48);
        doc.text(`Folio: ${vale.id.slice(0, 8).toUpperCase()}`, 150, 48);

        doc.setLineWidth(0.5);
        doc.line(15, 60, 195, 60);

        // Contenido
        doc.setFontSize(14);
        doc.text("DETALLES DEL EMPLEADO", 15, 75);

        doc.setFontSize(12);
        doc.text(`Nombre: ${user.nombre.toUpperCase()}`, 15, 85);
        doc.text(`ID Empleado: ${user.id}`, 15, 92);

        doc.setFontSize(14);
        doc.text("DETALLES DE LA SOLICITUD", 15, 110);

        doc.setFontSize(12);
        doc.text(`Tipo: ${vale.tipo === 'ABONO' ? 'HORAS A FAVOR (EXTRA)' : 'PERMISO / AUSENCIA'}`, 15, 120);
        doc.text(`Cantidad de Horas: ${vale.cantidad_horas}`, 15, 128);
        doc.text(`Estado: ${vale.estado}`, 15, 136);

        doc.setFontSize(12);
        doc.text("Motivo:", 15, 150);
        doc.setFont("helvetica", "italic");
        doc.text(vale.motivo || "Sin motivo especificado", 15, 158);

        // Firmas
        doc.setLineWidth(0.5);
        doc.line(30, 240, 90, 240); // Firma Empleado
        doc.line(120, 240, 180, 240); // Firma Supervisor

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("FIRMA DEL EMPLEADO", 40, 245);
        doc.text("AUTORIZADO POR (SUPERVISOR)", 125, 245);

        doc.save(`Vale_${vale.tipo}_${vale.created_at.slice(0, 10)}.pdf`);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-32">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase text-[var(--text-main)] flex items-center gap-3">
                        <Clock className="text-[var(--brand)]" size={32} />
                        Mi Personal
                    </h1>
                </div>

                {!['ADMIN', 'SUPERVISOR'].includes(user?.rol) && (
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-400">SALDO DISPONIBLE</p>
                        <p className="text-4xl font-black text-green-500 font-mono">
                            {vales
                                .filter(v => v.estado === 'APROBADO' || v.estado === 'PENDIENTE') // Simplificación
                                .reduce((acc, curr) => curr.tipo === 'ABONO' ? acc + parseFloat(curr.cantidad_horas) : acc - parseFloat(curr.cantidad_horas), 0)
                                .toFixed(1)
                            } HRS
                        </p>
                    </div>
                )}
            </header>

            {/* SUPER ADMIN: GESTIÓN DE USUARIOS */}
            {isSuperAdmin && (
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase text-[var(--text-main)] tracking-tight flex items-center gap-2">
                            <Users size={24} className="text-blue-600" />
                            Gestión de Usuarios
                        </h2>
                        <Button onClick={handleAddNewUser} icon={Plus} size="sm">
                            NUEVO USUARIO
                        </Button>
                    </div>
                    <UserTable
                        users={users}
                        onEdit={handleEditUser}
                        onDelete={deleteUser}
                        onResetPassword={(u) => {
                            const newPin = prompt('Nuevo PIN de 4 dígitos:');
                            if (newPin && newPin.length === 4) resetPassword(u.id, newPin);
                        }}
                    />
                </section>
            )}

            {/* ADMIN / SUPERVISOR VIEW: GESTIÓN DE PERSONAL (ASISTENCIA/VALES) */}
            {['ADMIN', 'SUPERVISOR'].includes(user?.rol) && (
                <div className="mb-12">
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 shadow-2xl border border-[var(--border-ui)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-[var(--brand)] rounded-2xl text-[var(--bg-card)]">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">Panel de Gestión</h2>
                                <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Aprobar Solicitudes y Asistencia</p>
                            </div>
                        </div>
                        <PersonalAdmin />
                    </div>
                </div>
            )
            }

            {!['ADMIN', 'SUPERVISOR'].includes(user?.rol) && (
                <>
                    {/* RELOJ CONTROL */}
                    <section className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 shadow-xl mb-12 flex flex-col items-center justify-center text-center border-2 border-[var(--border-ui)]">
                        <div className="mb-6">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${asistenciaHoy && !asistenciaHoy.salida
                                ? 'bg-green-100 text-green-700 animate-pulse'
                                : 'bg-slate-100 text-slate-500'
                                }`}>
                                {asistenciaHoy && !asistenciaHoy.salida ? '● Trabajando Ahora' : '● Fuera de Turno'}
                            </span>
                        </div>

                        <h2 className="text-8xl font-black text-slate-900 dark:text-white font-mono mb-2">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest mb-8">
                            {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>

                        <button
                            onClick={handleClockInOut}
                            disabled={loading || (asistenciaHoy && asistenciaHoy.salida)}
                            className={`
                            w-64 h-24 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                            ${!asistenciaHoy
                                    ? 'bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-[var(--bg-card)] shadow-[var(--brand)]/30'
                                    : asistenciaHoy.salida
                                        ? 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30'
                                }
                        `}
                        >
                            {!asistenciaHoy ? 'Marcar Entrada' : asistenciaHoy.salida ? 'Turno Finalizado' : 'Marcar Salida'}
                        </button>

                        {asistenciaHoy && !asistenciaHoy.salida && (
                            <p className="mt-4 text-xs font-bold text-slate-500">
                                Entrada registrada a las {new Date(asistenciaHoy.entrada).toLocaleTimeString()}
                            </p>
                        )}
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* HISTORIAL ASISTENCIA */}
                        <section className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-ui)]">
                            <h3 className="font-black uppercase text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Calendar size={18} /> Últimos 7 Días
                            </h3>
                            <div className="space-y-3">
                                {historial.length > 0 ? historial.map(record => (
                                    <div key={record.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                                {new Date(record.fecha).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 dark:text-white">{record.horas_trabajadas}h</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                {new Date(record.entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {record.salida ? new Date(record.salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-400 text-xs italic py-4">No hay registros recientes</p>
                                )}
                            </div>
                        </section>

                        {/* VALES Y SOLICITUDES */}
                        <section className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-sm border border-[var(--border-ui)]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                                    <FileText size={18} /> Mis Vales
                                </h3>
                                <button
                                    onClick={() => setShowValeModal(true)}
                                    className="bg-[var(--brand)] text-[var(--bg-card)] p-2 rounded-xl hover:scale-105 transition-all"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {vales.length > 0 ? vales.map(vale => (
                                    <div key={vale.id} className="p-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-100 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${vale.tipo === 'ABONO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {vale.tipo === 'ABONO' ? '+ Abono' : '- Cargo'}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase ${vale.estado === 'APROBADO' ? 'text-green-500' :
                                                vale.estado === 'PENDIENTE' ? 'text-amber-500' : 'text-red-500'
                                                }`}>
                                                {vale.estado}
                                            </span>
                                        </div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm mb-1">{vale.motivo}</p>
                                        <div className="flex justify-between items-end">
                                            <span className="font-mono font-black text-lg">{vale.cantidad_horas}h</span>
                                            {vale.estado === 'APROBADO' && (
                                                <button
                                                    onClick={() => generarPDF(vale)}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline uppercase"
                                                >
                                                    <Download size={12} /> Descargar PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-400 text-xs italic py-4">No hay vales registrados</p>
                                )}
                            </div>
                        </section>
                    </div>
                </>
            )}

            {/* MODAL SOLICITUD */}
            {
                showValeModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-[#1e2532] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
                            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-6">Solicitar Permiso / Vale</h3>
                            <form onSubmit={solicitarVale} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Motivo</label>
                                    <input
                                        type="text"
                                        required
                                        value={valeForm.motivo}
                                        onChange={e => setValeForm({ ...valeForm, motivo: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ej. Cita médica, Asunto personal..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Horas Solicitadas</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={valeForm.cantidad_horas}
                                        onChange={e => setValeForm({ ...valeForm, cantidad_horas: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ej. 2.5"
                                    />
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowValeModal(false)}
                                        className="flex-1 py-4 rounded-xl font-bold uppercase text-xs text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[var(--brand)] text-[var(--bg-card)] py-4 rounded-xl font-black uppercase text-xs hover:bg-[var(--brand-hover)] transition-all shadow-lg shadow-[var(--brand)]/20"
                                    >
                                        Enviar Solicitud
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* MODAL USUARIOS */}
            <UserModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                onSave={saveUser}
                editingUser={editingUser}
            />
        </div>
    );
};

export default Personal;
