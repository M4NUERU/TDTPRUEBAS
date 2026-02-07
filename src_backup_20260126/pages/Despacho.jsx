import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import Scanner from '../components/Scanner';
import { toast } from 'sonner';
import {
    Truck,
    Search,
    Barcode,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    Navigation,
    Calendar,
    User,
    Package,
    ChevronRight,
    QrCode,
    X,
    MessageCircle
} from 'lucide-react';

const TRANSPORTADORAS = ['ENVIA', 'DIC', 'COORDINADORA', 'SERVIENTREGA', 'OTRO'];

const Despacho = () => {
    // --- Auth & Permissions ---
    const user = JSON.parse(localStorage.getItem('todotejidos_user') || '{}');
    const isAdmin = user.rol === 'ADMIN';
    const canDispatch = ['ADMIN', 'SUPERVISOR', 'DESPACHADOR'].includes(user.rol);

    const [searchTerm, setSearchTerm] = useState('');
    const [foundPedido, setFoundPedido] = useState(null);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState('SEARCH'); // 'SEARCH' or 'GUIDE'
    const [pendingGuide, setPendingGuide] = useState('');

    // Bulk/Batch State
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchIndex, setBatchIndex] = useState(0);

    // Dispatching Form States
    const [dispatchData, setDispatchData] = useState({
        guia_transporte: '',
        transportadora: '',
        fecha_despacho: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchGlobalPending();
    }, []);

    const fetchGlobalPending = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('estado', 'TERMINADO')
            .order('fecha_ingreso', { ascending: true });

        if (!error) setPendingOrders(data);
        setLoading(false);
    };


    const handleScan = (decodedText) => {
        setIsScanning(false);
        const cleanCode = decodedText.trim().toUpperCase();

        if (scanMode === 'SEARCH') {
            // Try to find if it's an OC
            const match = pendingOrders.find(p => p.orden_compra === cleanCode);
            if (match) {
                handleOrderClick(match);
                toast.success('Orden de Compra reconocida');
            } else {
                // If not an OC, assume it's a guide to associate later
                setPendingGuide(cleanCode);
                setSearchTerm('');
                toast.success('Guía reconocida. Selecciona el pedido para asociar.');
            }
        } else if (scanMode === 'GUIDE') {
            setDispatchData(prev => ({ ...prev, guia_transporte: cleanCode }));
            toast.success('Guía escaneada');
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
        setPendingGuide(''); // Clear after assigning
    };

    const toggleOrderSelection = (id) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const startBatchDispatch = () => {
        if (selectedOrderIds.length === 0) return;
        setIsBatchMode(true);
        setBatchIndex(0);
        const firstId = selectedOrderIds[0];
        const firstOrder = pendingOrders.find(p => p.id === firstId);
        setFoundPedido(firstOrder);
        setDispatchData({
            guia_transporte: '',
            transportadora: firstOrder.transportadora || 'DIC',
            fecha_despacho: new Date().toISOString().split('T')[0]
        });
    };

    const nextBatchItem = () => {
        const nextIdx = batchIndex + 1;
        if (nextIdx < selectedOrderIds.length) {
            setBatchIndex(nextIdx);
            const nextOrder = pendingOrders.find(p => p.id === selectedOrderIds[nextIdx]);
            setFoundPedido(nextOrder);
            setDispatchData(prev => ({
                ...prev,
                guia_transporte: '',
                // Keep the transportadora if desired, or use the order's default
                transportadora: nextOrder.transportadora || prev.transportadora || 'DIC'
            }));
        } else {
            // Finished batch
            setIsBatchMode(false);
            setFoundPedido(null);
            setSelectedOrderIds([]);
            toast.success('¡Lote de despachos completado!');
        }
    };

    const filteredOrders = pendingOrders.filter(p =>
        p.orden_compra.toUpperCase().includes(searchTerm.toUpperCase()) ||
        p.cliente.toUpperCase().includes(searchTerm.toUpperCase())
    );

    const confirmDispatch = async () => {
        if (!foundPedido) return;
        if (!dispatchData.transportadora) {
            toast.error('Por favor selecciona una transportadora');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({
                    estado: 'ENVIADO',
                    guia_transporte: dispatchData.guia_transporte.toUpperCase(),
                    transportadora: dispatchData.transportadora,
                    fecha_despacho: dispatchData.fecha_despacho
                })
                .eq('id', foundPedido.id);

            if (error) throw error;

            toast.success(`Pedido ${foundPedido.orden_compra} despachado`);

            if (!isBatchMode) {
                setFoundPedido(null);
                setSearchTerm('');
            }

            fetchGlobalPending();

            if (isBatchMode) {
                nextBatchItem();
            }

            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } catch (err) {
            toast.error('Error al despachar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 bg-[var(--bg-main)] transition-colors duration-300">
            {/* Header Armonizado */}
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
                    <button
                        onClick={fetchGlobalPending}
                        className={`p-3 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-2xl hover:bg-[var(--border-ui)] transition-all ${loading && !foundPedido ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

                {/* Panel de Búsqueda y Escaneo Armonizado */}
                <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-ui)] shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                placeholder="ORDEN / CLIENTE / GUÍA..."
                                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-3xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase placeholder:opacity-30 tracking-tight"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setScanMode('SEARCH'); setIsScanning(!isScanning); }}
                                className={`px-6 h-[56px] rounded-3xl font-black transition-all flex items-center justify-center gap-2 text-[10px] uppercase ${isScanning ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105'}`}
                            >
                                {isScanning ? <X size={20} /> : <QrCode size={20} />}
                                {isScanning ? 'Cerrar' : 'Escanear'}
                            </button>
                            {selectedOrderIds.length > 0 && !foundPedido && (
                                <button
                                    onClick={startBatchDispatch}
                                    className="px-6 h-[56px] bg-emerald-600 text-white rounded-3xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all text-[10px] uppercase shadow-xl shadow-emerald-500/20 animate-in zoom-in"
                                >
                                    <Truck size={20} />
                                    Lote ({selectedOrderIds.length})
                                </button>
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
                        <div className="mt-4 aspect-video bg-black rounded-[2rem] overflow-hidden relative border-4 border-blue-500/20 shadow-2xl">
                            <Scanner onScanSuccess={handleScan} />
                            <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40 flex flex-col items-center justify-center">
                                <div className="w-56 h-32 border-2 border-blue-400/50 rounded-2xl relative">
                                    <div className="absolute inset-0 bg-blue-400/10 animate-pulse rounded-2xl"></div>
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-blue-500 rounded-tl-lg"></div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-blue-500 rounded-tr-lg"></div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-blue-500 rounded-bl-lg"></div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-blue-500 rounded-br-lg"></div>
                                </div>
                                <p className="mt-6 text-white font-black text-[9px] uppercase tracking-[0.3em] bg-blue-600 px-4 py-2 rounded-lg">
                                    Encuadre el Código
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resultado de Búsqueda / Acción de Despacho */}
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
                                {/* Details Grid */}
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

                                {/* Form Section */}
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

                                    <button
                                        onClick={confirmDispatch}
                                        disabled={loading}
                                        className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all uppercase flex items-center justify-center gap-4 text-sm mt-4 tracking-widest italic"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={24} /> : <Truck size={24} />}
                                        {loading ? 'DESPACHANDO...' : 'CONFIRMAR DESPACHO'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Lista Global Armonizada */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Por Despachar ({pendingOrders.length})</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredOrders.map(p => {
                                const isSelected = selectedOrderIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`bg-[var(--bg-card)] rounded-[2.5rem] border transition-all flex flex-col group relative overflow-hidden h-full ${isSelected ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-[var(--border-ui)] hover:border-blue-300'}`}
                                    >
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-black text-blue-600 text-xs tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{p.orden_compra}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleOrderSelection(p.id); }}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-ui)] bg-[var(--bg-input)]'}`}
                                                >
                                                    {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-[var(--text-main)] uppercase text-xs tracking-tight line-clamp-1 mb-1">{p.cliente}</h4>
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter line-clamp-2 opacity-60 leading-normal mb-8">{p.producto} <span className="text-blue-500 italic">[{p.cantidad} UND]</span></p>
                                                {p.fuente === 'WEB' && p.telefono_cliente && (
                                                    <a
                                                        href={`https://wa.me/57${p.telefono_cliente.replace(/\D/g, '')}?text=Hola ${p.cliente}, tu pedido ${p.orden_compra} ha sido despachado.`}
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
                                                onClick={() => handleOrderClick(p)}
                                                className="w-full py-4 bg-[var(--bg-input)] hover:bg-blue-600 hover:text-white text-[var(--text-main)] rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all mt-auto flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                            >
                                                Despachar <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredOrders.length === 0 && !loading && (
                                <div className="col-span-full py-20 bg-[var(--bg-card)] rounded-[3rem] border-2 border-dashed border-[var(--border-ui)] flex flex-col items-center justify-center text-[var(--text-muted)] opacity-20">
                                    <Package size={64} className="mb-4" />
                                    <p className="font-black uppercase text-[10px] tracking-[0.4em]">Sin registros</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Despacho;
