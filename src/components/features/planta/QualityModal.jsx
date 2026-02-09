import React, { useState } from 'react';
import { X, CheckCircle2, Star, CheckSquare, Square } from 'lucide-react';
import { Button } from '../../ui/Button';

const CHECKLISTS = {
    carpinteria: [
        'Estructura sólida y nivelada',
        'Medidas confirmadas con orden',
        'Lijado y sin astillas',
        'Refuerzos en esquinas instalados'
    ],
    costura: [
        'Costuras rectas y sin saltos',
        'Hilos sueltos cortados',
        'Cremalleras y cierres funcionales',
        'Forro interno ajustado'
    ],
    tapizado: [
        'Espuma distribuida uniformemente',
        'Tela tensionada correctamente',
        'Sin arrugas ni pliegues indeseados',
        'Limpieza final del mueble'
    ]
};

export const QualityModal = ({ isOpen, onClose, assignment, onSave }) => {
    const [checks, setChecks] = useState(assignment?.calidad || {
        carpinteria: { ok: false, rating: 0, items: [] },
        costura: { ok: false, rating: 0, items: [] },
        tapizado: { ok: false, rating: 0, items: [] }
    });

    if (!isOpen) return null;

    const handleToggleItem = (stage, item) => {
        setChecks(prev => {
            const currentItems = prev[stage].items || [];
            const newItems = currentItems.includes(item)
                ? currentItems.filter(i => i !== item)
                : [...currentItems, item];

            return {
                ...prev,
                [stage]: {
                    ...prev[stage],
                    items: newItems,
                    ok: newItems.length === CHECKLISTS[stage].length
                }
            };
        });
    };

    const handleRate = (stage, rating) => {
        setChecks(prev => ({
            ...prev,
            [stage]: { ...prev[stage], rating }
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-[2.5rem] border border-[var(--border-ui)] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 border-b border-[var(--border-ui)] flex justify-between items-center bg-[var(--bg-input)]/50">
                    <div>
                        <h2 className="text-xl font-black uppercase text-[var(--text-main)] tracking-tighter italic text-indigo-500">Certificado de Calidad</h2>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                            OC {assignment.pedidos?.orden_compra} • {assignment.pedidos?.producto}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar space-y-8">
                    {Object.keys(CHECKLISTS).map((stage) => (
                        <div key={stage} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase text-[var(--text-main)] tracking-wider flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${checks[stage].ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                    {stage === 'carpinteria' ? 'CARPINTERÍA' : stage === 'costura' ? 'COSTURA' : 'TAPIZADO'}
                                </h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRate(stage, star)}
                                            className={`transition-all ${star <= checks[stage].rating ? 'text-orange-400 scale-110' : 'text-slate-300 dark:text-slate-700 hover:text-orange-200'}`}
                                        >
                                            <Star size={14} fill={star <= checks[stage].rating ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {CHECKLISTS[stage].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleToggleItem(stage, item)}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${checks[stage].items?.includes(item)
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-[var(--bg-input)]/30 border-[var(--border-ui)] text-[var(--text-muted)] opacity-60 hover:opacity-100'}`}
                                    >
                                        {checks[stage].items?.includes(item) ? <CheckSquare size={16} className="shrink-0" /> : <Square size={16} className="shrink-0" />}
                                        <span className="text-[10px] font-bold uppercase leading-none">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-[var(--bg-input)]/20 flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl">Cancelar</Button>
                    <Button
                        variant="primary"
                        onClick={() => onSave(assignment.id, checks)}
                        className="flex-1 rounded-3xl shadow-xl shadow-blue-500/20 italic tracking-widest text-[10px]"
                    >
                        FIRMAR CERTIFICADO
                    </Button>
                </div>
            </div>
        </div>
    );
};
