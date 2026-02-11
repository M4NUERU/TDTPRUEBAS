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
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '../../ui/Input';

export const AssignmentModal = ({ isOpen, onClose, worker, date, orders, onAssign }) => {
    const [search, setSearch] = useState('');

    if (!isOpen || !worker) return null;

    const filtered = orders.filter(p =>
        (p.orden_compra?.toString() || '').includes(search) ||
        (p.producto?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.cliente?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] w-full max-w-2xl h-[80vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-6 border-b border-[var(--border-ui)] flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)]">
                        <ArrowLeft size={24} strokeWidth={3} />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Asignar a {worker.nombre}</h2>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-input)]/50">
                    <Input
                        search
                        placeholder="Buscar pedido..."
                        value={search}
                        onChange={setSearch}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filtered.map(p => (
                        <button
                            key={p.id}
                            onClick={() => onAssign(p, worker)}
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
    );
};
