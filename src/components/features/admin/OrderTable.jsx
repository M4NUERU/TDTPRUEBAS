/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export const OrderTable = ({ orders }) => {
    const [expandedOrder, setExpandedOrder] = useState(null);

    return (
        <div className="mt-4 w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-[var(--border-ui)]">
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Estado</th>
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Orden / Cliente</th>
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest w-72">Producto</th>
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest text-center">Cant.</th>
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Logística</th>
                        <th className="px-4 py-6 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Fechas</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-ui)]">
                    {orders.map(order => (
                        <React.Fragment key={order.id}>
                            <tr
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className={`group hover:bg-[var(--brand)]/5 transition-all duration-200 cursor-pointer ${expandedOrder === order.id ? 'bg-[var(--brand)]/5' : ''}`}
                            >
                                <td className="px-4 py-5">
                                    <Badge variant={
                                        order.estado === 'TERMINADO' ? 'success' :
                                            order.estado === 'ENVIADO' ? 'info' :
                                                order.estado === 'PENDIENTE' ? 'warning' : 'default'
                                    }>
                                        {order.estado}
                                    </Badge>
                                </td>
                                <td className="px-4 py-5">
                                    <div>
                                        <p className="font-black text-[11px] text-blue-600 uppercase tracking-tight group-hover:scale-105 transition-transform origin-left">OC {order.orden_compra}</p>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-1">{order.cliente}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-5">
                                    <p className="font-bold text-[10px] text-[var(--text-main)] uppercase leading-tight line-clamp-2" title={order.producto}>
                                        {order.producto}
                                    </p>
                                </td>
                                <td className="px-4 py-5 text-center">
                                    <span className="font-black text-[11px] text-[var(--text-main)] bg-[var(--bg-input)] px-2.5 py-1.5 rounded-xl border border-[var(--border-ui)]">
                                        {order.cantidad}
                                    </span>
                                </td>
                                <td className="px-4 py-5">
                                    <div className="flex flex-col gap-1.5">
                                        {order.transportadora ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-blue-500/10 rounded-md flex items-center justify-center">
                                                    <Truck size={10} className="text-blue-500" />
                                                </div>
                                                <span className="text-[9px] font-bold uppercase text-[var(--text-main)]">{order.transportadora}</span>
                                            </div>
                                        ) : <span className="text-[10px] text-[var(--text-muted)] italic opacity-30">- No asignado</span>}

                                        {order.guia_transporte && (
                                            <span className="text-[8px] font-black font-mono bg-[var(--bg-input)] px-2 py-1 rounded-lg text-slate-500 w-fit border border-[var(--border-ui)]">
                                                # {order.guia_transporte}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-5 text-right">
                                    <div className={`transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={16} className="text-[var(--text-muted)]" />
                                    </div>
                                </td>
                            </tr>
                            {expandedOrder === order.id && (
                                <tr className="bg-[var(--bg-input)]/30 border-l-2 border-blue-500 animate-in slide-in-from-top-1 duration-200">
                                    <td colSpan="6" className="px-8 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Responsable de Fabricación</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                        {order.operario_asignado?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="text-[11px] font-black text-[var(--text-main)] uppercase italic">
                                                        {order.operario_asignado || 'Personal por asignar'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Trazabilidad Temporal</p>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold text-[var(--text-main)] uppercase flex items-center gap-2">
                                                        <Clock size={12} className="text-blue-500" /> Ingreso: {order.fecha_ingreso || 'N/A'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-[var(--text-main)] uppercase flex items-center gap-2">
                                                        <CheckCircle2 size={12} className="text-emerald-500" /> Terminado: {order.fecha_terminado || 'En proceso'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Información Complementaria</p>
                                                <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-ui)]">
                                                    <p className="text-[10px] font-medium text-[var(--text-main)] leading-relaxed">
                                                        {order.notas_internas || 'Sin notas adicionales para este pedido.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-32 text-center text-[var(--text-muted)]/20">
                                <div className="flex flex-col items-center justify-center">
                                    <Package size={64} strokeWidth={1} className="mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Búsqueda sin resultados</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
