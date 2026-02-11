/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React, { useState, useEffect } from 'react';
import { usePurchasing } from '../hooks/usePurchasing';
import { useInventory } from '../hooks/useInventory';
import { ShoppingCart, Plus, Truck, FileText, CheckCircle, Clock, X, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const Compras = () => {
    const { orders, suppliers, loading, fetchOrders, saveSupplier, saveOrder, receiveOrder } = usePurchasing();
    const { items: inventoryItems } = useInventory();

    // UI Tags
    const [view, setView] = useState('DASHBOARD'); // DASHBOARD, PROVEEDORES, NUEVA_ORDEN
    const [companyFilter, setCompanyFilter] = useState('ALL');
    const [searchOrder, setSearchOrder] = useState('');

    // Modal States
    const [showSupplierModal, setShowSupplierModal] = useState(false);

    // Order Editor
    const [orderForm, setOrderForm] = useState({ supplierId: '', company: 'TODOTEJIDOS' });
    const [orderLines, setOrderLines] = useState([]);

    useEffect(() => {
        fetchOrders(companyFilter);
    }, [companyFilter]);

    // Handle Supplier Save
    const handleSupplierSave = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {
            razon_social: fd.get('razon_social'),
            nit: fd.get('nit'),
            contacto_nombre: fd.get('contacto'),
            telefono: fd.get('telefono'),
            email: fd.get('email'),
            categoria_insumo: fd.get('categoria')
        };
        const success = await saveSupplier(data);
        if (success) setShowSupplierModal(false);
    };

    // Handle New Order Init
    const initNewOrder = () => {
        setOrderForm({ supplierId: '', company: 'TODOTEJIDOS' });
        setOrderLines([]);
        setView('NUEVA_ORDEN');
    };

    const handleAddLine = () => {
        setOrderLines([...orderLines, { insumo_id: '', quantity: 1, price: 0 }]);
    };

    const updateLine = (idx, field, val) => {
        const newLines = [...orderLines];
        newLines[idx][field] = val;
        setOrderLines(newLines);
    };

    const removeLine = (idx) => {
        setOrderLines(orderLines.filter((_, i) => i !== idx));
    };

    const submitOrder = async () => {
        if (!orderForm.supplierId) return toast.error('Selecciona un proveedor');
        if (orderLines.length === 0) return toast.error('Agrega productos');

        const orderData = {
            proveedor_id: orderForm.supplierId,
            empresa_solicitante: orderForm.company,
            estado: 'BORRADOR',
            total_estimado: orderLines.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0)
        };

        const details = orderLines.map(l => ({
            insumo_id: l.insumo_id,
            cantidad_solicitada: l.quantity,
            precio_unitario: l.price
        }));

        const success = await saveOrder(orderData, details);
        if (success) setView('DASHBOARD');
    };

    // Filter displayed orders
    const filteredOrders = orders.filter(o =>
        (companyFilter === 'ALL' || o.empresa_solicitante === companyFilter) &&
        (o.proveedores?.razon_social.toLowerCase().includes(searchOrder.toLowerCase()) || String(o.consecutivo).includes(searchOrder))
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-6 py-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl text-white">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Compras y Abastecimiento</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Gestión de Proveedores y Órdenes</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={companyFilter}
                            onChange={e => setCompanyFilter(e.target.value)}
                            className="bg-[var(--bg-input)] font-bold text-xs rounded-xl px-3 outline-none border-none"
                        >
                            <option value="ALL">TODAS LAS EMPRESAS</option>
                            <option value="TODOTEJIDOS">TODO TEJIDOS</option>
                            <option value="EMADERA">E-MADERA</option>
                        </select>
                        {view !== 'NUEVA_ORDEN' && (
                            <>
                                <Button variant="secondary" onClick={() => setShowSupplierModal(true)}>PROVEEDORES</Button>
                                <Button icon={Plus} onClick={initNewOrder}>CREAR ORDEN</Button>
                            </>
                        )}
                        {view === 'NUEVA_ORDEN' && (
                            <Button variant="ghost" onClick={() => setView('DASHBOARD')}>CANCELAR</Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">

                {view === 'DASHBOARD' && (
                    <>
                        {/* Stats/Filters */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-orange-600 rounded-[2rem] p-6 text-white relative overflow-hidden">
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Por Recibir</h3>
                                <p className="text-4xl font-black">{filteredOrders.filter(o => o.estado === 'ENVIADA').length}</p>
                                <Truck className="absolute bottom-4 right-4 opacity-20" size={64} />
                            </div>
                            <div className="bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-[2rem] p-6 col-span-3 flex items-center gap-4">
                                <Search className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por proveedor o # orden..."
                                    className="w-full bg-transparent outline-none font-bold text-lg"
                                    value={searchOrder}
                                    onChange={e => setSearchOrder(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {filteredOrders.length === 0 ? (
                                <p className="text-center text-slate-400 font-bold italic py-10">No hay órdenes registradas.</p>
                            ) : (
                                filteredOrders.map(order => (
                                    <div key={order.id} className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-ui)] flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white ${order.estado === 'RECIBIDA' ? 'bg-emerald-500' :
                                                    order.estado === 'ENVIADA' ? 'bg-orange-500' : 'bg-slate-400'
                                                }`}>
                                                #{order.consecutivo}
                                            </div>
                                            <div>
                                                <div className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase mb-1 text-white ${order.empresa_solicitante === 'TODOTEJIDOS' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                                                    {order.empresa_solicitante}
                                                </div>
                                                <h3 className="text-lg font-black text-[var(--text-main)]">{order.proveedores?.razon_social}</h3>
                                                <p className="text-xs text-slate-400 font-bold">{new Date(order.created_at).toLocaleDateString()} • {order.ordenes_compra_detalles?.length || 0} Items</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black uppercase text-slate-400">Total Estimado</p>
                                                <p className="text-xl font-black text-[var(--text-main)]">${order.total_estimado?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {order.estado !== 'RECIBIDA' ? (
                                                    <Button
                                                        size="sm"
                                                        variant={order.estado === 'BORRADOR' ? 'primary' : 'secondary'}
                                                        icon={order.estado === 'ENVIADA' ? CheckCircle : FileText}
                                                        onClick={() => {
                                                            if (order.estado === 'ENVIADA') receiveOrder(order.id);
                                                            else toast.info('Funcionalidad de editar/enviar completa pendiente en MVP');
                                                        }}
                                                    >
                                                        {order.estado === 'ENVIADA' ? 'RECIBIR' : 'GESTIONAR'}
                                                    </Button>
                                                ) : (
                                                    <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-black text-xs rounded-xl uppercase flex items-center gap-2">
                                                        <CheckCircle size={14} /> Recibido
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {view === 'NUEVA_ORDEN' && (
                    <div className="max-w-4xl mx-auto bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-ui)] shadow-2xl animate-in slide-in-from-bottom-5">
                        <h2 className="text-2xl font-black uppercase text-[var(--text-main)] mb-8 flex items-center gap-3">
                            <Plus className="text-emerald-500" /> Nueva Orden de Compra
                        </h2>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Proveedor</label>
                                <select
                                    className="w-full mt-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 font-bold text-sm border-none outline-none"
                                    value={orderForm.supplierId}
                                    onChange={e => setOrderForm({ ...orderForm, supplierId: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.razon_social}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Empresa Solicitante (Factura A)</label>
                                <select
                                    className="w-full mt-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 font-bold text-sm border-none outline-none"
                                    value={orderForm.company}
                                    onChange={e => setOrderForm({ ...orderForm, company: e.target.value })}
                                >
                                    <option value="TODOTEJIDOS">TODOTEJIDOS</option>
                                    <option value="EMADERA">E-MADERA</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-sm uppercase text-slate-500">Items a Solicitar</h3>
                                <Button size="sm" variant="secondary" onClick={handleAddLine} icon={Plus}>Agregar Producto</Button>
                            </div>
                            <div className="space-y-2">
                                {orderLines.map((line, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <select
                                                className="w-full bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                                value={line.insumo_id}
                                                onChange={e => updateLine(idx, 'insumo_id', e.target.value)}
                                            >
                                                <option value="">Producto...</option>
                                                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.nombre} (Stock: {i.cantidad})</option>)}
                                            </select>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Cant."
                                            className="w-20 bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                            value={line.quantity}
                                            onChange={e => updateLine(idx, 'quantity', Number(e.target.value))}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Precio Und."
                                            className="w-24 bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                            value={line.price}
                                            onChange={e => updateLine(idx, 'price', Number(e.target.value))}
                                        />
                                        <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-500 p-2"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <span className="text-xl font-black text-[var(--text-main)] mr-6">
                                Total: ${orderLines.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0).toLocaleString()}
                            </span>
                            <Button onClick={submitOrder} size="lg">GENERAR BORRADOR</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Proveedor */}
            {showSupplierModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSupplierSave} className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">Nuevo Proveedor</h2>
                            <button type="button" onClick={() => setShowSupplierModal(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <Input name="razon_social" label="Razón Social" required />
                            <Input name="nit" label="NIT / Documento" required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input name="contacto" label="Nombre Contacto" />
                                <Input name="telefono" label="Teléfono" />
                            </div>
                            <Input name="email" label="Email" type="email" />
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoría Principal</label>
                                <select name="categoria" className="w-full mt-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 font-bold text-xs border border-transparent focus:border-emerald-500 outline-none">
                                    <option value="TELAS">Telas</option>
                                    <option value="INSUMOS">Insumos Varios</option>
                                    <option value="MADERAS">Maderas</option>
                                    <option value="MAQUINARIA">Maquinaria</option>
                                </select>
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-8" size="lg">Guardar Proveedor</Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Compras;
