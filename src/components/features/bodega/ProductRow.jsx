import React from 'react';
import { Plus, Minus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export const ProductRow = ({ item, onUpdateStock, onEdit, onDelete, canEdit, isAdmin }) => {
    const isLow = item.cantidad <= (item.stock_minimo || 5);

    return (
        <tr className={`transition-colors border-b border-[var(--border-ui)] ${isLow ? 'bg-red-500/5 border-l-4 border-l-red-500' : 'bg-[var(--bg-card)]'}`}>
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-xs uppercase dark:text-white leading-tight">{item.nombre}</span>
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            {item.categoria}
                        </Badge>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.empresa === 'EMADERA' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                            {item.empresa || 'TODOTEJIDOS'}
                        </span>
                        {isLow && <Badge variant="danger">BAJO</Badge>}
                    </div>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic mt-1 line-clamp-1">
                        {item.observaciones || 'General'}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">{item.unidad_medida}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 bg-[var(--bg-input)]/50 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => onUpdateStock(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[var(--text-muted)] transition-colors active:scale-90"
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className={`text-xs font-black min-w-[2rem] text-center ${isLow ? 'text-red-600 dark:text-red-400' : 'dark:text-white'}`}>
                        {item.cantidad}
                    </span>
                    <button
                        onClick={() => onUpdateStock(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-blue-600 hover:text-white bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg transition-all active:scale-90"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                    {canEdit && (
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={() => onDelete(item.id)} className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
