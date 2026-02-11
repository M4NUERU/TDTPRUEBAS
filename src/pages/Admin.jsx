/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAdmin } from '../hooks/useAdmin';
import { useOrders } from '../hooks/useOrders';
import { ShieldCheck, Plus, RefreshCw, Layers, Users, AlertTriangle, Clock, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserTable } from '../components/features/admin/UserTable';
// Note: UserModal logic would be similar to MaterialModal, keeping it inline or next extraction task if complex. 
// For this pass, I'll keep the Modal simple or assume extracting it next if it's large.
// Given Admin.jsx was HUGE, let's extract the UserModal too for completeness.

import { OrderTable } from '../components/features/admin/OrderTable';

const Admin = () => {
    // Auth
    const user = useAuthStore((state) => state.user);
    const isSuperAdmin = user?.rol === 'ADMIN';

    // Logic
    const { users, stats, loading: adminLoading, fetchUsers, fetchStats, saveUser, deleteUser, resetPassword } = useAdmin();
    // Fetch all orders for the admin dashboard, without status filter (null means all in our new useOrders logic? No, useOrders takes status. Let's create a special mode or fetch all.)
    // Note: useOrders currently fetches by status. Let's start with all PENDING for visibility or modify useOrders.
    // Actually, Despachadores want to see details. Let's fetch all relevant ones.
    const [allOrders, setAllOrders] = useState([]);

    // Quick fix: reuse useOrders but we need a way to get ALL.
    // Or just import supabase here for the specific "All Orders" query if useOrders is too specific.
    // Let's modify useOrders slightly to accept null for "ALL"? 
    // For now, let's just use the 'PENDIENTE' one as a base and maybe fix it later, or better:
    // Let's fetch ALL orders for the "Zone of Pedidos".

    // We can use a direct useEffect here for simplicity since useOrders is tailored for Despacho flow (specific statuses)
    // Or instantiate useOrders multiple times? No.
    // Let's add a "view mode" to this dashboard.

    const { orders: pendingOrders, fetchOrders: refreshPending } = useOrders('PENDIENTE');
    const { orders: dispatchedOrders, fetchOrders: refreshDispatched } = useOrders('ENVIADO');

    // Combine for display or just show pending by default? User said "zona de pedidos", usually implies everything or management.
    // Let's show Pending by default but allow switching.
    const [orderFilter, setOrderFilter] = useState('PENDIENTE');
    const [searchTerm, setSearchTerm] = useState('');

    const filterOrders = (ordersList) => {
        if (!searchTerm) return ordersList;
        const lowSearch = searchTerm.toLowerCase();
        return ordersList.filter(o =>
            (o.orden_compra && o.orden_compra.toString().toLowerCase().includes(lowSearch)) ||
            (o.cliente && o.cliente.toLowerCase().includes(lowSearch)) ||
            (o.producto && o.producto.toLowerCase().includes(lowSearch))
        );
    };

    const handleRefresh = () => {
        if (isSuperAdmin) {
            fetchUsers();
            fetchStats();
        }
        refreshPending();
        refreshDispatched();
    };

    // Stats Config
    const statCards = [
        { label: 'Pedidos Totales', value: stats.scanned, icon: Layers, color: 'bg-blue-500' },
        { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'bg-orange-500' },
        { label: 'Personal', value: stats.staff, icon: Users, color: 'bg-emerald-500' }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header with Stats Integrated */}
            <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-ui)] px-4 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[var(--brand)] rounded-2xl text-white shadow-lg shadow-[var(--brand)]/20">
                            <ShieldCheck size={28} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase dark:text-white hidden lg:block">Panel de Control</h1>
                    </div>

                    {/* Integrated Stats Summary */}
                    <div className="flex-1 flex justify-center md:justify-end items-center gap-4 lg:gap-12 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                        {statCards.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-3 shrink-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-sm shrink-0`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-[var(--text-main)] leading-none">{stat.value}</span>
                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tight opacity-70">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            onClick={() => window.location.href = '/produccion?action=new'}
                            className="rounded-xl flex items-center gap-2 px-6"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Nuevo Pedido</span>
                        </Button>
                        <Button variant="ghost" onClick={handleRefresh} loading={adminLoading} size="icon" className="rounded-xl">
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[98%] mx-auto p-4 sm:p-8">
                {/* Orders Section - Integrated Flow */}
                <div className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-[95px] z-20 py-4 bg-[var(--bg-main)]/95 backdrop-blur-sm -mx-4 px-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={orderFilter === 'PENDIENTE' ? 'primary' : 'ghost'}
                                onClick={() => setOrderFilter('PENDIENTE')}
                                size="sm"
                                className="rounded-full px-6"
                            >
                                Pendientes
                            </Button>
                            <Button
                                variant={orderFilter === 'ENVIADO' ? 'primary' : 'ghost'}
                                onClick={() => setOrderFilter('ENVIADO')}
                                size="sm"
                                className="rounded-full px-6"
                            >
                                Enviados / Historial
                            </Button>
                            <Button
                                variant={orderFilter === 'TERMINADO' ? 'primary' : 'ghost'}
                                onClick={() => setOrderFilter('TERMINADO')}
                                size="sm"
                                className="rounded-full px-6"
                            >
                                En Despacho
                            </Button>
                        </div>

                        <div className="w-full md:w-72">
                            <Input
                                placeholder="Buscar orden o cliente..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                                search
                                className="!space-y-0"
                            />
                        </div>
                    </div>

                    {/* We need the data for the selected filter. 
                       The basic useOrders hook was fixed to one status.
                       Let's do a quick hack: instantiate 3 hooks is inefficient but safe for now, 
                       or better: let's use a "DynamicOrderTable" wrapper.
                       For speed, I will map the filter to the data I have.
                   */}
                    {orderFilter === 'PENDIENTE' && <OrderTable orders={filterOrders(pendingOrders)} />}
                    {orderFilter === 'ENVIADO' && <OrderTable orders={filterOrders(dispatchedOrders)} />}
                    {orderFilter === 'TERMINADO' && (
                        // We need another hook instance or reuse
                        <DynamicOrderList status="TERMINADO" searchTerm={searchTerm} />
                    )}
                </div>
            </main>
        </div>
    );
};

// Helper component to fetch on demand
const DynamicOrderList = ({ status, searchTerm }) => {
    const { orders } = useOrders(status);

    const filtered = !searchTerm ? orders : orders.filter(o =>
        (o.orden_compra && o.orden_compra.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.cliente && o.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.producto && o.producto.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return <OrderTable orders={filtered} />;
};

export default Admin;
