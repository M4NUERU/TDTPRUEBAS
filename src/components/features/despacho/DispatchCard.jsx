import React from 'react';
import { CheckCircle2, MessageCircle, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export const DispatchCard = ({ order, isSelected, onToggleSelect, onDispatch, showWhatsApp = true }) => {
    return (
        <Card className={`flex flex-col h-full relative group transition-all ${isSelected ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'hover:border-blue-300'}`}>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="info" className="px-3 py-1 text-xs">{order.orden_compra}</Badge>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${order.empresa === 'EMADERA' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                        {order.empresa || 'TODOTEJIDOS'}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(order.id); }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-ui)] bg-[var(--bg-input)]'}`}
                    >
                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </button>
                </div>

                <div className="flex-1">
                    <h4 className="font-black text-[var(--text-main)] uppercase text-xs tracking-tight line-clamp-1 mb-1">{order.cliente}</h4>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter line-clamp-2 opacity-60 leading-normal mb-8">
                        {order.producto} <span className="text-blue-500 italic">[{order.cantidad} UND]</span>
                    </p>

                    {showWhatsApp && order.fuente === 'WEB' && order.telefono_cliente && (
                        <a
                            href={`https://wa.me/57${order.telefono_cliente.replace(/\D/g, '')}?text=Hola ${order.cliente}, tu pedido ${order.orden_compra} ha sido despachado.`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-20 right-6 p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10"
                            title="Notificar por WhatsApp"
                        >
                            <MessageCircle size={16} />
                        </a>
                    )}
                </div>

                <button
                    onClick={() => onDispatch(order)}
                    className="w-full py-4 bg-[var(--bg-input)] hover:bg-blue-600 hover:text-white text-[var(--text-main)] rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all mt-auto flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                    Despachar <ChevronRight size={14} />
                </button>
            </div>
        </Card>
    );
};
