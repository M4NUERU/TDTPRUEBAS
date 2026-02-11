/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React from 'react';
import { User, Plus, Minus, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';

export const WorkerCard = ({ worker, assignments, onAssign, onRemoveAssignment, onUpdateProgress, isOperario, onQualityOpen }) => {
    const total = assignments.reduce((acc, a) => acc + a.unidades_totales, 0);
    const done = assignments.reduce((acc, a) => acc + a.unidades_completadas, 0);

    return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-ui)] overflow-hidden shadow-sm flex flex-col hover:border-blue-400/50 transition-all">
            {/* Header */}
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

            {/* List */}
            <div className="flex-1 p-2 space-y-1.5">
                {assignments.length > 0 ? assignments.map(a => (
                    <div key={a.id} className={`p-2 rounded-xl border transition-all ${a.estado === 'TERMINADO' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-[var(--bg-card)] border-[var(--border-ui)]'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-blue-600 uppercase tracking-tighter">OC {a.pedidos?.orden_compra}</span>
                                <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase leading-tight line-clamp-1">{a.pedidos?.producto}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onQualityOpen(a)}
                                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Control de Calidad"
                                >
                                    <ShieldCheck size={14} />
                                </button>
                                <button onClick={() => onRemoveAssignment(a.id)} className="p-1 text-[var(--text-muted)] hover:text-red-500">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center bg-[var(--bg-input)] p-0.5 rounded-lg">
                                <button onClick={() => onUpdateProgress(a, -1)} className="p-1 text-[var(--text-muted)] hover:bg-white dark:hover:bg-slate-700 rounded-md"><Minus size={12} /></button>
                                <span className="text-[11px] font-black w-6 text-center dark:text-white">{a.unidades_completadas}</span>
                                <button onClick={() => onUpdateProgress(a, 1)} className="p-1 text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-md"><Plus size={12} /></button>
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

            {/* Footer */}
            <Button
                variant="ghost"
                size="sm"
                className="w-full border-t border-[var(--border-ui)] rounded-t-none hover:bg-blue-50 dark:hover:bg-blue-900/10 text-blue-600"
                onClick={() => onAssign(worker)}
                icon={Plus}
            >
                Asignar Tarea
            </Button>
        </div>
    );
};
