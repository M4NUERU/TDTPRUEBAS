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
import { useAuthStore } from '../store/authStore';
import { useOrders } from '../hooks/useOrders';
import { Truck, MessageCircle, RefreshCw, Search, X, QrCode, Calendar, Navigation, Barcode, User, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DispatchCard } from '../components/features/despacho/DispatchCard';
import Scanner from '../components/Scanner';

const TRANSPORTADORAS = ['ENVIA', 'DIC', 'COORDINADORA', 'SERVIENTREGA', 'OTRO'];

const Despacho = () => {
    // Auth
    const user = useAuthStore((state) => state.user);
    const canDispatch = ['ADMIN', 'SUPERVISOR', 'DESPACHADOR'].includes(user?.rol);

    // Hooks
    const { orders: pendingOrders, loading, fetchOrders, dispatchOrder } = useOrders('TERMINADO');

    // Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState('SEARCH'); // SEARCH, GUIDE

    // Selection / Batch
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [foundPedido, setFoundPedido] = useState(null);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchIndex, setBatchIndex] = useState(0);

    // Form
    const [dispatchData, setDispatchData] = useState({
        guia_transporte: '',
        transportadora: '',
        fecha_despacho: new Date().toISOString().split('T')[0]
    });
    const [pendingGuide, setPendingGuide] = useState('');

    // --- Actions ---

    const handleScan = (decodedText) => {
        setIsScanning(false);
        const cleanCode = decodedText.trim().toUpperCase();

        if (scanMode === 'SEARCH') {
            const match = pendingOrders.find(p => p.orden_compra === cleanCode);
            if (match) {
                handleOrderClick(match);
            } else {
                setPendingGuide(cleanCode);
                setSearchTerm('');
            }
        } else if (scanMode === 'GUIDE') {
            setDispatchData(prev => ({ ...prev, guia_transporte: cleanCode }));
        }
    };

    const handleOrderClick = (pedido) => {
        if (selectedOrderIds.length > 0) {
            toggleOrderSelection(pedido.id);
            return;
        }
        setFoundPedido(pedido);
        setDispatchData({
            guia_transporte: pendingGuide || pedido.guia_transporte || '',
            transportadora: pedido.transportadora || 'ENVIA',
            fecha_despacho: new Date().toISOString().split('T')[0]
        });
        setPendingGuide('');
    };

    const toggleOrderSelection = (id) => {
        setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
    };

    const startBatchDispatch = () => {
        if (selectedOrderIds.length === 0) return;
        setIsBatchMode(true);
        setBatchIndex(0);
        prepareBatchItem(0);
    };

    const prepareBatchItem = (index) => {
        const orderId = selectedOrderIds[index];
        const order = pendingOrders.find(p => p.id === orderId);
        if (order) {
            setFoundPedido(order);
            setDispatchData(prev => ({
                guia_transporte: '',
                transportadora: order.transportadora || prev.transportadora || 'DIC',
                fecha_despacho: new Date().toISOString().split('T')[0]
            }));
        }
    };

    const nextBatchItem = () => {
        const nextIdx = batchIndex + 1;
        if (nextIdx < selectedOrderIds.length) {
            setBatchIndex(nextIdx);
            prepareBatchItem(nextIdx);
        } else {
            setIsBatchMode(false);
            setFoundPedido(null);
            setSelectedOrderIds([]);
        }
    };

    const handleConfirmDispatch = async () => {
        if (!foundPedido) return;

        const success = await dispatchOrder(foundPedido.id, dispatchData);

        if (success) {
            if (!isBatchMode) {
                setFoundPedido(null);
                setSearchTerm('');
            }
            if (isBatchMode) {
                nextBatchItem();
            }
        }
    };

    const filteredOrders = pendingOrders.filter(p =>
        p.orden_compra.toUpperCase().includes(searchTerm.toUpperCase()) ||
        p.cliente.toUpperCase().includes(searchTerm.toUpperCase())
    );

    return (
        <div className="min-h-screen pb-32 bg-[var(--bg-main)] transition-colors duration-300">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] sticky top-0 z-40 px-6 py-8 transition-colors">
                <div className="max-w-[98%] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter italic">Logística</h1>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Control de Despachos</p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={fetchOrders} loading={loading} size="icon">
                        <RefreshCw size={20} />
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Search & Scan Panel */}
                <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)] shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                search
                                value={searchTerm}
                                onChange={val => setSearchTerm(val.toUpperCase())}
                                placeholder="ORDEN / CLIENTE / GUÍA..."
                                className="h-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={isScanning ? 'danger' : 'primary'}
                                onClick={() => { setScanMode('SEARCH'); setIsScanning(!isScanning); }}
                                className="h-[56px] rounded-3xl"
                                icon={isScanning ? X : QrCode}
                            >
                                {isScanning ? 'Cerrar' : 'Escanear'}
                            </Button>

                            {selectedOrderIds.length > 0 && !foundPedido && (
                                <Button
                                    variant="success"
                                    onClick={startBatchDispatch}
                                    className="h-[56px] rounded-3xl"
                                    icon={Truck}
                                >
                                    Lote ({selectedOrderIds.length})
                                </Button>
                            )}
                        </div>
                    </div>

                    {pendingGuide && (
                        <div className="mt-4 p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-blue-900/20 rounded-2xl text-blue-600">
                                    <Barcode size={24} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Guía Seleccionada</p>
                                    <p className="font-black text-blue-800 dark:text-blue-300 uppercase">{pendingGuide}</p>
                                </div>
                            </div>
                            <button onClick={() => setPendingGuide('')} className="p-2 text-blue-400 hover:text-blue-600">
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {isScanning && (
                        <div className="mt-4 aspect-video bg-black rounded-[2rem] overflow-hidden relative border-4 border-[var(--border-ui)] shadow-2xl">
                            <Scanner onScanSuccess={handleScan} />
                        </div>
                    )}
                </div>

                {/* Dispatch Form or List */}
                {foundPedido ? (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-2xl mx-auto">
                        <div className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-ui)] shadow-2xl overflow-hidden">
                            <div className="bg-blue-600 p-8 text-white flex justify-between items-center relative">
                                {isBatchMode && (
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500">
                                        <div
                                            className="h-full bg-white/50 transition-all duration-500 shadow-[0_0_10px_white]"
                                            style={{ width: `${((batchIndex + 1) / selectedOrderIds.length) * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">Action Required</span>
                                        {isBatchMode && <span className="bg-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{batchIndex + 1} de {selectedOrderIds.length}</span>}
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                                        OC: {foundPedido.orden_compra}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setFoundPedido(null);
                                        if (isBatchMode) {
                                            setIsBatchMode(false);
                                            setSelectedOrderIds([]);
                                        }
                                    }}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="p-6 bg-[var(--bg-input)]/50 rounded-3xl border border-[var(--border-ui)]">
                                        <div className="flex items-center gap-3 mb-3 text-blue-500 opacity-60">
                                            <User size={18} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Destinatario</span>
                                        </div>
                                        <p className="font-black text-[var(--text-main)] uppercase text-sm tracking-tight leading-tight">{foundPedido.cliente}</p>
                                    </div>
                                    <div className="p-6 bg-[var(--bg-input)]/50 rounded-3xl border border-[var(--border-ui)]">
                                        <div className="flex items-center gap-3 mb-3 text-orange-500 opacity-60">
                                            <Package size={18} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Producto</span>
                                        </div>
                                        <p className="font-black text-[var(--text-main)] uppercase text-sm tracking-tight leading-tight">{foundPedido.producto}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <Navigation size={12} className="text-blue-500" /> Transportadora
                                            </label>
                                            <select
                                                className="w-full p-5 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-[1.5rem] font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                                value={dispatchData.transportadora}
                                                onChange={(e) => setDispatchData({ ...dispatchData, transportadora: e.target.value })}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                                <Barcode size={12} className="text-blue-500" /> Número de Guía
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    className="w-full p-5 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-[1.5rem] font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase placeholder:opacity-20"
                                                    placeholder="ESCRIBE O ESCANEA..."
                                                    value={dispatchData.guia_transporte}
                                                    onChange={(e) => setDispatchData({ ...dispatchData, guia_transporte: e.target.value.toUpperCase() })}
                                                />
                                                <button
                                                    onClick={() => { setScanMode('GUIDE'); setIsScanning(true); }}
                                                    className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[1.5rem] hover:bg-blue-100 transition-all border border-blue-200 dark:border-blue-900/30"
                                                >
                                                    <QrCode size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-2 flex items-center gap-2">
                                            <Calendar size={12} className="text-blue-500" /> Fecha de Despacho
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-5 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-[1.5rem] font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all"
                                            value={dispatchData.fecha_despacho}
                                            onChange={(e) => setDispatchData({ ...dispatchData, fecha_despacho: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleConfirmDispatch}
                                        loading={loading}
                                        className="w-full py-6 rounded-3xl shadow-2xl shadow-blue-500/40 text-sm tracking-widest italic"
                                        size="lg"
                                        icon={Truck}
                                    >
                                        CONFIRMAR DESPACHO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredOrders.map(order => (
                            <DispatchCard
                                key={order.id}
                                order={order}
                                isSelected={selectedOrderIds.includes(order.id)}
                                onToggleSelect={toggleOrderSelection}
                                onDispatch={handleOrderClick}
                            />
                        ))}
                        {filteredOrders.length === 0 && !loading && (
                            <div className="col-span-full py-20 bg-[var(--bg-card)] rounded-[3rem] border-2 border-dashed border-[var(--border-ui)] flex flex-col items-center justify-center text-[var(--text-muted)] opacity-20">
                                <Package size={64} className="mb-4" />
                                <p className="font-black uppercase text-[10px] tracking-[0.4em]">Sin registros</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Despacho;
