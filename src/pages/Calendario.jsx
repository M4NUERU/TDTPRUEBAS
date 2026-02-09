import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Package,
    Search,
    Filter
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const Calendario = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    // Fetch pending orders
    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('pedidos')
                .select('*')
                .in('estado', ['PENDIENTE', 'TERMINADO']); // Show what's yet to be shipped

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching calendar orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });

    const totalDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to start on Monday

    const days = [];
    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i));
    }

    const getOrdersForDay = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return orders.filter(o => o.fecha_limite === dateStr);
    };

    const getUrgencyColor = (orders) => {
        if (orders.length === 0) return '';
        const today = new Date().toISOString().split('T')[0];
        const hasLate = orders.some(o => o.fecha_limite <= today && o.estado === 'PENDIENTE');
        if (hasLate) return 'bg-red-500/10 border-red-500/30 text-red-600';
        return 'bg-blue-500/10 border-blue-500/30 text-blue-600';
    };

    return (
        <div className="min-h-screen pb-32 bg-[var(--bg-main)]">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] sticky top-0 z-40 px-6 py-8">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/10">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Agenda de Despachos</h1>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 text-indigo-500">Cronograma de Pedidos Pendientes</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--bg-input)] p-2 rounded-3xl border border-[var(--border-ui)]">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-2xl">
                            <ChevronLeft size={20} />
                        </Button>
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)] w-40 text-center">
                            {monthName} {year}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-2xl">
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[98%] mx-auto p-4 md:p-8">
                {/* Calendar Grid */}
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-ui)] shadow-xl overflow-hidden">
                    {/* Days of week */}
                    <div className="grid grid-cols-7 bg-[var(--bg-input)]/50 border-b border-[var(--border-ui)]">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                            <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar cells */}
                    <div className="grid grid-cols-7 auto-rows-[160px]">
                        {days.map((date, i) => {
                            const dayOrders = getOrdersForDay(date);
                            const isToday = date && date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                            return (
                                <div
                                    key={i}
                                    className={`
                                        border-r border-b border-[var(--border-ui)] p-3 transition-all relative group
                                        ${!date ? 'bg-[var(--bg-input)]/20' : 'hover:bg-[var(--brand)]/5 cursor-pointer'}
                                        ${isToday ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}
                                    `}
                                    onClick={() => date && setSelectedDate(date)}
                                >
                                    {date && (
                                        <>
                                            <span className={`
                                                text-sm font-black mb-2 block
                                                ${isToday ? 'text-indigo-600' : 'text-[var(--text-muted)]'}
                                            `}>
                                                {date.getDate()}
                                            </span>

                                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                                                {dayOrders.slice(0, 3).map(o => (
                                                    <div key={o.id} className={`
                                                        px-2 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-tighter truncate
                                                        ${o.estado === 'TERMINADO' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600'}
                                                    `}>
                                                        {o.cliente} - OC {o.orden_compra}
                                                    </div>
                                                ))}
                                                {dayOrders.length > 3 && (
                                                    <div className="text-[8px] font-black text-indigo-500 px-2 py-1 uppercase italic">
                                                        + {dayOrders.length - 3} más...
                                                    </div>
                                                )}
                                            </div>

                                            {dayOrders.length > 0 && (
                                                <div className="absolute bottom-2 right-2">
                                                    <div className={`w-2 h-2 rounded-full ${dayOrders.some(o => o.estado === 'PENDIENTE') ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Details Modal (Simplified inline for now) */}
                {selectedDate && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-[var(--text-main)] italic">
                                    Pedidos para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                </h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="rounded-xl">
                                Cerrar
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getOrdersForDay(selectedDate).length > 0 ? (
                                getOrdersForDay(selectedDate).map(order => (
                                    <div key={order.id} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-ui)] shadow-sm hover:shadow-xl transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant={order.estado === 'PENDIENTE' ? 'warning' : 'success'}>
                                                {order.estado}
                                            </Badge>
                                            <span className="text-[10px] font-black text-[var(--text-muted)]">OC {order.orden_compra}</span>
                                        </div>
                                        <h4 className="font-black text-[var(--text-main)] uppercase text-sm mb-1 group-hover:text-indigo-600 transition-colors">{order.cliente}</h4>
                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase mb-4 line-clamp-1">{order.producto}</p>

                                        <div className="pt-4 border-t border-[var(--border-ui)] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                    <Package size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-[var(--text-main)]">{order.cantidad} Unidades</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-[9px] font-black h-8 px-3" onClick={() => window.location.href = `/produccion?search=${order.orden_compra}`}>
                                                VER DETALLES
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 bg-[var(--bg-input)]/20 rounded-[2rem] border-2 border-dashed border-[var(--border-ui)] flex flex-col items-center justify-center text-[var(--text-muted)]">
                                    <Package size={40} className="mb-2 opacity-20" />
                                    <p className="font-black uppercase text-[10px] tracking-widest opacity-20">Sin despachos programados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendario;
