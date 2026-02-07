import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, FileText, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import logo from '../assets/logo.jpeg';

const PersonalAdmin = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [historialSolicitudes, setHistorialSolicitudes] = useState([]);
    const [staffStatus, setStaffStatus] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 0. Cargar Operarios (para evitar ambigüedad en joins)
            const { data: ops } = await supabase.from('operarios').select('id, nombre, cargo');
            const opsMap = {};
            if (ops) ops.forEach(op => opsMap[op.id] = op);

            // 1. Solicitudes Pendientes (Sin join ambiguo)
            const { data: sols, error: solsError } = await supabase
                .from('vales_tiempo')
                .select('*')
                .eq('estado', 'PENDIENTE')
                .order('created_at', { ascending: false });

            if (solsError) {
                console.error("Error fetching solicitudes:", solsError);
                toast.error("Error cargando solicitudes (Posiblemente falta DB)");
            }

            // Mapear nombres manualmente
            const solicitudesConNombres = (sols || []).map(s => ({
                ...s,
                operarios: opsMap[s.operario_id] || { nombre: 'Desconocido' }
            }));

            setSolicitudes(solicitudesConNombres);

            // 1.5 Historial de Solicitudes (Aprobadas/Rechazadas)
            const { data: histSols } = await supabase
                .from('vales_tiempo')
                .select('*')
                .neq('estado', 'PENDIENTE')
                .order('created_at', { ascending: false })
                .limit(20);

            const historialConNombres = (histSols || []).map(s => ({
                ...s,
                operarios: opsMap[s.operario_id] || { nombre: 'Desconocido' }
            }));
            setHistorialSolicitudes(historialConNombres);

            // 2. Estado del Staff (Hoy) - Aquí el join sí funciona (1 FK)
            const today = new Date().toISOString().split('T')[0];
            const { data: status } = await supabase
                .from('asistencia')
                .select('*, operarios(nombre, cargo)')
                .eq('fecha', today);
            setStaffStatus(status || []);
        } catch (err) {
            console.error("Critical error in fetchData:", err);
            toast.error("Error de conexión");
        }
    };

    const handleAction = async (id, action, currentData) => {
        try {
            const { error } = await supabase
                .from('vales_tiempo')
                .update({
                    estado: action,
                    fecha_aprobacion: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Solicitud ${action.toLowerCase()}`);

            if (action === 'APROBADO') {
                generarPDF(currentData);
            }
            fetchData();
        } catch (err) {
            toast.error('Error al procesar solicitud');
        }
    };

    const generarPDF = (vale) => {
        const doc = new jsPDF();

        // --- DISEÑO PROFESIONAL ---
        // Borde exterior
        doc.setLineWidth(1.5);
        doc.rect(10, 10, 190, 277);

        // Logo y Encabezado
        try { doc.addImage(logo, 'JPEG', 20, 20, 30, 30); } catch (e) { }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("VALE DE AUTORIZACIÓN", 105, 30, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("TODOTEJIDOS SAS", 105, 38, { align: "center" });
        doc.text("NIT: 900.123.456-7 | Departamento de Recursos Humanos", 105, 43, { align: "center" });

        // Línea separadora
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 55, 190, 55);

        // Datos del Vale
        doc.setFontSize(11);
        const startY = 70;

        // Caja de Información
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(20, 65, 170, 70, 3, 3, 'F');

        doc.setFont("helvetica", "bold");
        doc.text("FOLIO:", 30, 80);
        doc.setFont("helvetica", "normal");
        doc.text(vale.id.slice(0, 8).toUpperCase(), 60, 80);

        doc.setFont("helvetica", "bold");
        doc.text("FECHA:", 110, 80);
        doc.setFont("helvetica", "normal");
        doc.text(new Date().toLocaleDateString(), 140, 80);

        doc.setFont("helvetica", "bold");
        doc.text("EMPLEADO:", 30, 95);
        doc.setFont("helvetica", "normal");
        doc.text(vale.operarios?.nombre?.toUpperCase() || "N/A", 60, 95);

        doc.setFont("helvetica", "bold");
        doc.text("TIPO:", 30, 110);
        doc.setFont("helvetica", "normal");
        doc.text(vale.tipo === 'ABONO' ? 'HORAS EXTRA (A FAVOR)' : 'PERMISO (A CARGO)', 60, 110);

        doc.setFont("helvetica", "bold");
        doc.text("CANTIDAD:", 110, 110);
        doc.setFont("helvetica", "normal");
        doc.text(`${vale.cantidad_horas} HORAS`, 140, 110);

        // Motivo
        doc.setFont("helvetica", "bold");
        doc.text("MOTIVO DETALLADO:", 30, 125);
        doc.setFont("helvetica", "italic");
        const splitText = doc.splitTextToSize(vale.motivo || "Sin motivo especificado", 150);
        doc.text(splitText, 30, 132);

        // Firmas
        const firmaY = 220;
        doc.line(30, firmaY, 90, firmaY);
        doc.line(120, firmaY, 180, firmaY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("FIRMA DEL EMPLEADO", 60, firmaY + 5, { align: "center" });
        doc.text("AUTORIZADO POR", 150, firmaY + 5, { align: "center" });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Este documento certifica la autorización de horas según las políticas internas.", 105, 270, { align: "center" });

        doc.save(`Vale_${vale.id.slice(0, 6)}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOLICITUDES PENDIENTES */}
                <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 border border-[var(--border-ui)] shadow-sm">
                    <h3 className="font-black uppercase text-[var(--text-main)] mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-amber-500" /> Solicitudes Pendientes
                        <button onClick={fetchData} className="ml-auto p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" title="Actualizar">
                            <RefreshCw size={14} />
                        </button>
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {solicitudes.length > 0 ? solicitudes.map(s => (
                            <div key={s.id} className="p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border-ui)]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-xs uppercase text-[var(--text-main)]">{s.operarios?.nombre}</span>
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">{s.tipo}</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] mb-2 italic">"{s.motivo}"</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-mono font-black">{s.cantidad_horas}h</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(s.id, 'RECHAZADO')}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(s.id, 'APROBADO', s)}
                                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-[var(--text-muted)] text-xs italic py-8">No hay solicitudes pendientes</p>
                        )}
                    </div>
                </div>

                {/* ASISTENCIA DE HOY */}
                <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 border border-[var(--border-ui)] shadow-sm">
                    <h3 className="font-black uppercase text-[var(--text-main)] mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" /> Asistencia Hoy
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {staffStatus.length > 0 ? staffStatus.map(st => (
                            <div key={st.id} className="flex justify-between items-center p-3 bg-[var(--bg-input)]/30 rounded-xl border border-[var(--border-ui)]">
                                <div>
                                    <p className="font-black text-xs uppercase text-[var(--text-main)]">{st.operarios?.nombre}</p>
                                    <p className="text-[8px] text-[var(--text-muted)] uppercase">{st.operarios?.cargo}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${st.salida ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700 animate-pulse'}`}>
                                        {st.salida ? 'FINALIZADO' : 'ACTIVO'}
                                    </span>
                                    <p className="text-[9px] font-mono mt-0.5">
                                        {new Date(st.entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-[var(--text-muted)] text-xs italic py-8">Nadie ha registrado entrada hoy</p>
                        )}
                    </div>
                </div>
            </div>

            {/* HISTORIAL DE SOLICITUDES */}
            <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 border border-[var(--border-ui)] shadow-sm">
                <h3 className="font-black uppercase text-[var(--text-main)] mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-slate-400" /> Historial Reciente
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="text-[var(--text-muted)] border-b border-[var(--border-ui)]">
                            <tr>
                                <th className="pb-2 pl-2">FECHA</th>
                                <th className="pb-2">EMPLEADO</th>
                                <th className="pb-2">TIPO</th>
                                <th className="pb-2">HORAS</th>
                                <th className="pb-2">ESTADO</th>
                                <th className="pb-2 text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-ui)]">
                            {historialSolicitudes.map(h => (
                                <tr key={h.id} className="text-[var(--text-main)]">
                                    <td className="py-3 pl-2 opacity-70">{new Date(h.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 font-bold">{h.operarios?.nombre}</td>
                                    <td className="py-3">{h.tipo}</td>
                                    <td className="py-3 font-mono">{h.cantidad_horas}h</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${h.estado === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {h.estado}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        {h.estado === 'APROBADO' && (
                                            <button onClick={() => generarPDF(h)} className="text-blue-600 hover:text-blue-500 font-bold uppercase text-[9px] flex items-center gap-1 justify-end">
                                                <Download size={12} /> PDF
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {historialSolicitudes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-[var(--text-muted)] italic">No hay historial disponible</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PersonalAdmin;
