import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseExcelPlanTrabajo } from '../utils/excelParser';
import { toast } from 'sonner';
import { Upload, Table as TableIcon, FileSpreadsheet, RefreshCw, Star, Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Trash2, Edit, UserPlus, Users, Package, Settings, X, ArrowLeft, Calendar, Download, Plus, Lock, MessageCircle, Sun, Moon } from 'lucide-react';
import { exportConfigToExcel, exportOrdersToExcel } from '../utils/excelExport';
import PersonalAdmin from '../components/PersonalAdmin';

const Admin = ({ isDark, toggleTheme }) => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Auth & Permissions
    const user = JSON.parse(localStorage.getItem('todotejidos_user') || '{}');
    const isAdmin = user.rol === 'ADMIN';
    const isSupervisor = user.rol === 'SUPERVISOR';
    const isDespachador = user.rol === 'DESPACHADOR';
    const canManageConfig = isAdmin || isSupervisor;
    const canEditOrders = isAdmin || isSupervisor;

    // New States for Pagination & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [priorityFilter, setPriorityFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({ total: 0, pendiente: 0, enviado: 0 });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ cliente: '', producto: '', cantidad: '', operario_asignado: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const itemsPerPage = 50;

    // Export Options State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportOptions, setExportOptions] = useState({
        includeWorkers: true,
        includeClients: true,
        includeProducts: true
    });

    // Configuración States
    const [mainView, setMainView] = useState('PEDIDOS'); // PEDIDOS, CONFIG
    const [workers, setWorkers] = useState([]);
    const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [workerFormData, setWorkerFormData] = useState({ nombre: '', cargo: 'Tapicero', pin: '', rol: 'OPERARIO' });
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [catalogType, setCatalogType] = useState('cliente'); // 'cliente' or 'producto'
    const [catalogItemName, setCatalogItemName] = useState('');

    const fetchWorkers = async () => {
        const { data, error } = await supabase.from('operarios').select('*').order('nombre', { ascending: true });
        if (error) {
            console.error('Error operarios:', error);
            toast.error('Error al cargar equipo. ¿Ya creaste la tabla "operarios"?');
            return;
        }
        setWorkers(data || []);
    };

    useEffect(() => {
        if (mainView === 'CONFIG') {
            fetchWorkers();
            fetchCatalogos();
        }
    }, [mainView]);

    const fetchCatalogos = async () => {
        try {
            const { data: cData, error: cError } = await supabase.from('clientes').select('*').order('nombre');
            const { data: pData, error: pError } = await supabase.from('productos').select('*').order('nombre');

            if (cError || pError) {
                console.error('Error cargando catálogos:', cError || pError);
                toast.error('Error de Base de Datos', {
                    description: 'Faltan las tablas de catálogos. Por favor ejecuta el script SQL en Supabase.',
                    duration: 10000
                });
                return;
            }

            if (cData) setClients(cData);
            if (pData) setProducts(pData);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const fetchStats = async () => {
        const today = new Date().toISOString().split('T')[0];

        const { count: total } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('fecha_ingreso', today);
        const { count: pendiente } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'PENDIENTE');
        const { count: enviado } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'ENVIADO');

        setStats({
            total: total || 0,
            pendiente: pendiente || 0,
            enviado: enviado || 0
        });
    };


    useEffect(() => {
        fetchPedidos();
        fetchStats();
    }, [currentPage, statusFilter, priorityFilter, startDate, endDate]);

    // Handle search with a small delay or button
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on search
            fetchPedidos();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    // Modificar fetchPedidos para soportar ordenamiento
    const fetchPedidos = async (sortOrder = 'desc') => {
        setLoading(true);
        try {
            let query = supabase
                .from('pedidos')
                .select('*', { count: 'exact' });

            // Filtros
            if (searchTerm) {
                query = query.or(`cliente.ilike.%${searchTerm}%,orden_compra.ilike.%${searchTerm}%,producto.ilike.%${searchTerm}%`);
            }
            if (statusFilter !== 'TODOS') {
                query = query.eq('estado', statusFilter);
            }
            if (priorityFilter) {
                query = query.eq('prioridad', true);
            }
            if (startDate) {
                query = query.gte('fecha_ingreso', startDate);
            }
            if (endDate) {
                query = query.lte('fecha_ingreso', endDate);
            }

            // Ordenamiento por fecha
            query = query.order('fecha_ingreso', { ascending: sortOrder === 'asc' });

            // Paginación
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) {
                console.error('Error fetching pedidos:', error);
                toast.error('Error cargando pedidos');
            } else {
                setPedidos(data || []);
                setTotalItems(count || 0);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Error inesperado al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    // ... (useEffect for fetchPedidos remains same, just ensure it uses default or state sort)

    const processFile = async (file) => {
        setUploading(true);
        try {
            const parsedData = await parseExcelPlanTrabajo(file);

            if (!parsedData || parsedData.length === 0) {
                toast.error('No se encontraron pedidos válidos');
                return;
            }

            // --- BATCHING PARA LEER ESTADOS EXISTENTES ---
            // Supabase/PostgREST tiene un límite en la longitud de la URL (filtros .in muy largos fallan)
            // Procesaremos la verificación de existentes en lotes de 500

            const existingStatusMap = {};
            const chunkSize = 500;
            const allOCs = parsedData.map(p => p.orden_compra);

            for (let i = 0; i < allOCs.length; i += chunkSize) {
                const chunkOCs = allOCs.slice(i, i + chunkSize);
                const { data: foundRecords, error } = await supabase
                    .from('pedidos')
                    .select('orden_compra, estado')
                    .in('orden_compra', chunkOCs);

                if (error) {
                    console.error('Error fetching chunk existing:', error);
                    continue; // Intentamos seguir
                }

                foundRecords?.forEach(r => {
                    existingStatusMap[r.orden_compra] = r.estado;
                });
            }

            // 2. Fusionar: Si ya existe en la DB y NO es 'PENDIENTE', mantenemos el estado de la DB
            const finalData = parsedData.map(p => {
                const currentStatus = existingStatusMap[p.orden_compra];
                // Si ya existe y tiene un estado avanzado, NO lo sobeescribimos con lo del Excel (a menos que el Excel diga ENVIADO/TERMINADO explicitamente, pero aquí priorizamos la info histórica de la DB si el Excel viene "basico")
                // PERO: Si el nuevo parser detectó color (ENVIADO), eso viene en `p.estado`.
                // Lógica: Si el Excel dice PENDIENTE, pero la DB dice ENVIADO, mantenemos ENVIADO.
                // Si el Excel dice ENVIADO (por color), forzamos ENVIADO.

                if (p.estado === 'ENVIADO') return p; // El color manda hoy

                if (currentStatus && currentStatus !== 'PENDIENTE') {
                    return { ...p, estado: currentStatus };
                }
                return p;
            });

            // 3. Upsert en lotes para evitar payload too large
            // Ahora insertamos en la DB
            let successCount = 0;
            for (let i = 0; i < finalData.length; i += chunkSize) {
                const chunk = finalData.slice(i, i + chunkSize);
                const { error } = await supabase
                    .from('pedidos')
                    .upsert(chunk, { onConflict: 'orden_compra' });

                if (error) {
                    console.error('Upsert chunk error:', error);
                    toast.error(`Error guardando lote ${i / chunkSize + 1}`);
                } else {
                    successCount += chunk.length;
                }
            }

            toast.success(`${successCount} registros procesados con éxito`);
            fetchPedidos();
            fetchStats();
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Error al procesar el archivo Excel', { description: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este pedido?')) return;
        const { error } = await supabase.from('pedidos').delete().eq('id', id);
        if (error) toast.error('Error al eliminar');
        else {
            toast.success('Pedido eliminado');
            fetchPedidos();
            fetchStats();
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('!!! ADVERTENCIA !!! ¿Realmente quieres borrar TODOS los registros de la base de datos? Esta acción es irreversible.')) return;
        const { error } = await supabase.from('pedidos').delete().gte('created_at', '1970-01-01'); // Delete all records
        if (error) toast.error('Error al limpiar base de datos');
        else {
            toast.success('Base de datos vaciada');
            fetchPedidos();
            fetchStats();
        }
    };

    const handleEdit = async (id) => {
        const { error } = await supabase.from('pedidos').update(editForm).eq('id', id);
        if (error) toast.error('Error al actualizar');
        else {
            toast.success('Pedido actualizado');
            setEditingId(null);
            fetchPedidos();
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Seguro que quieres eliminar ${selectedIds.length} pedidos?`)) return;
        const { error } = await supabase.from('pedidos').delete().in('id', selectedIds);
        if (error) toast.error('Error al eliminar lote');
        else {
            toast.success('Lote eliminado');
            setSelectedIds([]);
            fetchPedidos();
            fetchStats();
        }
    };

    const handleBulkStatus = async (newStatus) => {
        const { error } = await supabase.from('pedidos').update({ estado: newStatus }).in('id', selectedIds);
        if (error) toast.error('Error al actualizar lote');
        else {
            toast.success(`Pedidos actualizados a ${newStatus}`);
            setSelectedIds([]);
            fetchPedidos();
            fetchStats();
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pedidos.length) setSelectedIds([]);
        else setSelectedIds(pedidos.map(p => p.id));
    };

    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualOrder, setManualOrder] = useState({
        orden_compra: '',
        cliente: '',
        producto: '',
        cantidad: 1,
        prioridad: false,
        transportadora: 'ENVIA',
        fuente: 'MANUAL',
        operario_asignado: ''
    });

    const [suggestions, setSuggestions] = useState({ clientes: [], productos: [], transportadoras: [] });
    const [showSuggestions, setShowSuggestions] = useState({ cliente: false, producto: false, transportadora: false });

    useEffect(() => {
        const fetchSuggestions = async () => {
            // Priority 1: Catalog tables
            const { data: catClients } = await supabase.from('clientes').select('nombre');
            const { data: catProds } = await supabase.from('productos').select('nombre');

            // Priority 2: Historical data for transportadoras (still dynamic)
            const { data: rawOrders } = await supabase.from('pedidos').select('transportadora').limit(500);

            setSuggestions({
                clientes: catClients?.map(c => c.nombre) || [],
                productos: catProds?.map(p => p.nombre) || [],
                transportadoras: [...new Set(rawOrders?.map(r => r.transportadora))].filter(Boolean)
            });
        };
        if (isManualModalOpen) fetchSuggestions();
    }, [isManualModalOpen]);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('pedidos').insert([
                { ...manualOrder, estado: 'PENDIENTE', fecha_ingreso: new Date().toISOString().split('T')[0] }
            ]);
            if (error) throw error;
            toast.success('Pedido agregado manualmente');
            setIsManualModalOpen(false);
            setManualOrder({ orden_compra: '', cliente: '', producto: '', cantidad: 1, prioridad: false, transportadora: 'ENVIA', operario_asignado: '' });
            fetchPedidos();
        } catch (err) {
            toast.error('Error al guardar pedido: ' + err.message);
        }
    };
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header Armonizado */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-4 py-6 sticky top-0 z-30">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {canManageConfig && (
                                <button
                                    onClick={() => setMainView(mainView === 'PEDIDOS' ? 'CONFIG' : 'PEDIDOS')}
                                    className={`p-2 rounded-xl transition-all ${mainView === 'CONFIG' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}
                                    title={mainView === 'PEDIDOS' ? 'Configuración' : 'Volver a Pedidos'}
                                >
                                    {mainView === 'CONFIG' ? <ArrowLeft size={24} /> : <Settings size={24} />}
                                </button>
                            )}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-[var(--bg-input)] rounded-xl transition-all"
                                title="Cambiar Tema"
                            >
                                {isDark ? <Sun size={24} /> : <Moon size={24} />}
                            </button>
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase dark:text-white">
                            {mainView === 'PEDIDOS' ? 'ADMINISTRACIÓN' : 'CONFIGURACIÓN'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {mainView === 'PEDIDOS' && canEditOrders && (
                            <>
                                <button
                                    onClick={() => setIsManualModalOpen(true)}
                                    className="p-2 md:p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    title="Nuevo Pedido"
                                >
                                    <Plus size={22} strokeWidth={3} />
                                    <span className="hidden md:block text-[10px] font-black uppercase">Nuevo Pedido</span>
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-all"
                                    title="Limpiar Todo"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </>
                        )}
                        <button onClick={() => { fetchPedidos(); fetchStats(); }} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-xl">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {mainView === 'PEDIDOS' ? (
                <div className="max-w-[98%] mx-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-ui)] shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none">{stats.total}</h4>
                                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mt-1">Ingresados Hoy</p>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-ui)] shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none">{stats.pendiente}</h4>
                                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mt-1">Pendientes</p>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-ui)] shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter leading-none">{stats.enviado}</h4>
                                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mt-1">Enviados</p>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Upload Zone Compacta */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <label
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all bg-[var(--bg-card)] relative ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-[var(--border-ui)] hover:border-blue-400'}`}
                                >
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
                                            <Upload size={24} />
                                        </div>
                                        <h3 className="text-xs font-black text-[var(--text-main)] uppercase">Importar Plan</h3>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter mt-1">Arrastra tu XLSX o haz clic</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} disabled={uploading} id="file-upload" />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-[var(--bg-card)]/90 flex flex-col items-center justify-center rounded-3xl z-10">
                                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <p className="text-blue-600 text-[10px] font-black uppercase">Procesando...</p>
                                        </div>
                                    )}
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => exportOrdersToExcel(pedidos)}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                                    >
                                        <Download size={14} /> Exportar
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('file-upload').click()}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                    >
                                        <Upload size={14} /> Importar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Table Profesionall */}
                        <div className="lg:col-span-3">
                            <div className="bg-[var(--bg-card)] rounded-[2rem] shadow-sm border border-[var(--border-ui)] overflow-hidden">
                                <div className="p-4 bg-[var(--bg-input)]/30 border-b border-[var(--border-ui)] space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                                                <TableIcon size={16} />
                                            </div>
                                            <h2 className="font-black text-xs uppercase tracking-tighter text-[var(--text-main)]">Explorador de Pedidos</h2>
                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[8px] font-black rounded-full uppercase">{totalItems} registros</span>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="BUSCAR OC O CLIENTE..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-xl text-[10px] font-bold uppercase outline-none focus:border-blue-500 transition-all dark:text-white"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setPriorityFilter(!priorityFilter)}
                                                className={`p-2 rounded-xl border transition-all ${priorityFilter ? 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600' : 'bg-[var(--bg-card)] border-[var(--border-ui)] text-[var(--text-muted)] hover:text-red-500'}`}
                                            >
                                                <Star size={16} fill={priorityFilter ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                                        {['TODOS', 'PENDIENTE', 'TERMINADO', 'ENVIADO'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all tracking-widest ${statusFilter === status
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-[var(--bg-card)] border border-[var(--border-ui)] text-[var(--text-muted)] hover:border-blue-400'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Bulk Action Bar Compacta */}
                                    {selectedIds.length > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-white px-2 py-0.5 bg-blue-700 rounded-lg">{selectedIds.length}</span>
                                                <div className="flex gap-1">
                                                    {['PENDIENTE', 'TERMINADO', 'ENVIADO'].map(s => (
                                                        <button key={s} onClick={() => handleBulkStatus(s)} className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[8px] font-black uppercase transition-all">
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={handleBulkDelete} className="p-1.5 text-white/70 hover:text-white" title="BORRAR SELECCIÓN">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[var(--bg-input)]/50 text-[var(--text-muted)] text-[9px] uppercase font-black tracking-widest">
                                            <tr>
                                                <th className="px-4 py-3 w-8">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.length === pedidos.length && pedidos.length > 0}
                                                        onChange={toggleSelectAll}
                                                        className="rounded border-[var(--border-ui)] bg-transparent text-blue-600 w-3.5 h-3.5"
                                                    />
                                                </th>
                                                <th className="px-4 py-3">OC</th>
                                                <th className="px-4 py-3">CLIENTE / PRODUCTO</th>
                                                <th className="px-4 py-3">ESTADO / ASIGNADO</th>
                                                <th className="px-4 py-3">LOGÍSTICA</th>
                                                <th className="px-4 py-3 text-right">ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-ui)]">
                                            {pedidos.map((p) => (
                                                <tr key={p.id} className={`hover:bg-blue-50/10 transition-colors ${p.prioridad ? 'bg-red-50/5 dark:bg-red-900/5' : ''} ${selectedIds.includes(p.id) ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(p.id)}
                                                            onChange={() => toggleSelect(p.id)}
                                                            className="rounded border-[var(--border-ui)] bg-transparent text-blue-600 w-3.5 h-3.5"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    const { error } = await supabase.from('pedidos').update({ prioridad: !p.prioridad }).eq('id', p.id);
                                                                    if (error) toast.error('Error prioridad');
                                                                    else fetchPedidos();
                                                                }}
                                                                className={`transition-colors ${p.prioridad ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-400'}`}
                                                            >
                                                                <Star size={14} fill={p.prioridad ? 'currentColor' : 'none'} />
                                                            </button>
                                                            <div className="flex flex-col">
                                                                <span className="font-mono font-black text-blue-600 text-xs tracking-tighter">{p.orden_compra}</span>
                                                                {p.fuente === 'WEB' && (
                                                                    <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded w-fit mt-0.5 border border-emerald-200 dark:border-emerald-800">ECOMMERCE</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {editingId === p.id ? (
                                                            <div className="space-y-1.5 p-1">
                                                                <input className="w-full p-2 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-lg text-[10px] font-bold uppercase outline-none focus:border-blue-500" value={editForm.cliente} onChange={e => setEditForm({ ...editForm, cliente: e.target.value.toUpperCase() })} />
                                                                <textarea className="w-full p-2 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-lg text-[10px] font-bold uppercase outline-none focus:border-blue-500 h-16" value={editForm.producto} onChange={e => setEditForm({ ...editForm, producto: e.target.value.toUpperCase() })} />
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => handleEdit(p.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">Guardar</button>
                                                                    <button onClick={() => setEditingId(null)} className="bg-[var(--bg-input)] text-[var(--text-muted)] px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">X</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="max-w-xs">
                                                                <div className="font-black text-[var(--text-main)] uppercase text-[11px] tracking-tight truncate">{p.cliente}</div>
                                                                <div className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-tighter truncate opacity-70 mt-0.5">{p.producto} <span className="text-blue-500">[{p.cantidad} UND]</span></div>
                                                                {p.fuente === 'WEB' && (p.email_cliente || p.telefono_cliente) && (
                                                                    <div className="flex flex-col gap-1 mt-1">
                                                                        <div className="text-[7px] text-slate-400 font-bold uppercase truncate">
                                                                            {p.email_cliente} {p.telefono_cliente && `• ${p.telefono_cliente}`}
                                                                        </div>
                                                                        {p.telefono_cliente && (
                                                                            <a
                                                                                href={`https://wa.me/57${p.telefono_cliente.replace(/\D/g, '')}?text=Hola ${p.cliente}, tu pedido ${p.orden_compra} está en estado: ${p.estado}.`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 hover:text-emerald-500 transition-colors w-fit"
                                                                            >
                                                                                <MessageCircle size={10} /> Notificar Estado
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-center ${p.estado === 'ENVIADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                p.estado === 'TERMINADO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                                                }`}>
                                                                {p.estado}
                                                            </span>
                                                            {p.operario_asignado && (
                                                                <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-tighter px-2 py-0.5 bg-[var(--bg-input)]/50 rounded text-center truncate">
                                                                    {p.operario_asignado}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-[var(--text-main)] text-[10px] font-black uppercase truncate">{p.transportadora || 'N/A'}</div>
                                                        {p.fecha_despacho && <div className="text-[var(--text-muted)] text-[8px] font-bold mt-0.5 opacity-60 italic">{new Date(p.fecha_despacho).toLocaleDateString()}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {canEditOrders && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(p.id);
                                                                        setEditForm({ cliente: p.cliente, producto: p.producto, cantidad: p.cantidad, operario_asignado: p.operario_asignado || '' });
                                                                    }}
                                                                    className="p-1.5 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(p.id)}
                                                                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {pedidos.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-12 text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest italic opacity-30">No hay pedidos registrados</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Modernizada */}
                                <div className="p-4 bg-[var(--bg-input)]/30 border-t border-[var(--border-ui)] flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                        Viendo <span className="text-[var(--text-main)] italic">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(totalItems, currentPage * itemsPerPage)}</span> de <span className="text-[var(--text-main)]">{totalItems}</span> registros
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={currentPage === 1 || loading}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-2 border border-[var(--border-ui)] rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-20 hover:border-blue-400 transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-xl text-[10px] font-black text-[var(--text-main)]">
                                            {currentPage} / {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                                        </div>
                                        <button
                                            disabled={loading || currentPage * itemsPerPage >= totalItems}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-2 border border-[var(--border-ui)] rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-20 hover:border-blue-400 transition-all"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-[98%] mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* EQUIPO SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 border border-[var(--border-ui)] shadow-sm flex flex-col hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                                        <Users size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">Equipo</h3>
                                </div>
                                <button
                                    onClick={() => { setEditingWorker(null); setWorkerFormData({ nombre: '', cargo: 'Tapicero', pin: '' }); setIsWorkerModalOpen(true); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} strokeWidth={3} /> AGREGAR
                                </button>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-2 max-h-[400px] no-scrollbar">
                                {workers.map(w => (
                                    <div key={w.id} className="bg-[var(--bg-input)]/50 p-4 rounded-2xl border border-[var(--border-ui)] flex items-center justify-between group hover:border-blue-400 transition-all">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-black text-[var(--text-main)] uppercase text-[10px] truncate">{w.nombre}</h4>
                                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-md opacity-70">
                                                    {w.rol || 'OPERARIO'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase opacity-70">{w.cargo}</p>
                                                <div className="flex items-center gap-1">
                                                    <Lock size={8} className="text-blue-500" />
                                                    <span className="text-[9px] font-black tracking-widest text-blue-600">{w.pin || '0000'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingWorker(w);
                                                    setWorkerFormData({ nombre: w.nombre, cargo: w.cargo, pin: w.pin || '', rol: w.rol || 'OPERARIO' });
                                                    setIsWorkerModalOpen(true);
                                                }}
                                                className="p-1.5 text-[var(--text-muted)] hover:text-blue-500"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={async () => { if (confirm('¿ELIMINAR OPERARIO?')) { await supabase.from('operarios').delete().eq('id', w.id); fetchWorkers(); } }} className="p-1.5 text-[var(--text-muted)] hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {workers.length === 0 && <p className="text-center py-8 text-[var(--text-muted)] text-[9px] font-black uppercase opacity-30 italic">No hay operarios</p>}
                            </div>
                        </div>

                        {/* PERSONAL ADMIN SECTION */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 border border-[var(--border-ui)] shadow-sm">
                                <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter mb-6 flex items-center gap-2">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                                        <Users size={18} />
                                    </div>
                                    Gestión de Personal & Vales
                                </h3>
                                <PersonalAdmin />
                            </div>
                        </div>

                        {/* CLIENTES SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 border border-[var(--border-ui)] shadow-sm flex flex-col hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                                        <Users size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">Clientes</h3>
                                </div>
                                <button
                                    onClick={() => { setCatalogType('cliente'); setCatalogItemName(''); setIsCatalogModalOpen(true); }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} strokeWidth={3} /> AGREGAR
                                </button>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-2 max-h-[400px] no-scrollbar">
                                {clients.map(c => (
                                    <div key={c.id} className="flex justify-between items-center p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border-ui)] hover:border-emerald-400 transition-all group">
                                        <span className="font-black text-[var(--text-main)] uppercase text-[10px] truncate">{c.nombre}</span>
                                        <button onClick={async () => { if (confirm('¿ELIMINAR CLIENTE?')) { await supabase.from('clientes').delete().eq('id', c.id); fetchCatalogos(); } }} className="p-1.5 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                {clients.length === 0 && <p className="text-center py-8 text-[var(--text-muted)] text-[9px] font-black uppercase opacity-30 italic">No hay clientes</p>}
                            </div>
                        </div>

                        {/* PRODUCTOS SECTION */}
                        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 border border-[var(--border-ui)] shadow-sm flex flex-col hover:border-orange-500/30 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                                        <Package size={18} />
                                    </div>
                                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">Productos</h3>
                                </div>
                                <button
                                    onClick={() => { setCatalogType('producto'); setCatalogItemName(''); setIsCatalogModalOpen(true); }}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} strokeWidth={3} /> AGREGAR
                                </button>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-2 max-h-[400px] no-scrollbar">
                                {products.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-4 bg-[var(--bg-input)]/50 rounded-2xl border border-[var(--border-ui)] hover:border-orange-400 transition-all group">
                                        <span className="font-black text-[var(--text-main)] uppercase text-[10px] truncate">{p.nombre}</span>
                                        <button onClick={async () => { if (confirm('¿ELIMINAR PRODUCTO?')) { await supabase.from('productos').delete().eq('id', p.id); fetchCatalogos(); } }} className="p-1.5 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                {products.length === 0 && <p className="text-center py-8 text-[var(--text-muted)] text-[9px] font-black uppercase opacity-30 italic">No hay productos</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Manual Armonizado */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-[2.5rem] p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-600 rounded-xl text-white">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Registro Manual</h2>
                        </div>

                        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1 space-y-1.5">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Orden de Compra</label>
                                <input
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                    placeholder="EJ: 123456"
                                    required
                                    value={manualOrder.orden_compra}
                                    onChange={(e) => setManualOrder({ ...manualOrder, orden_compra: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="col-span-1 space-y-1.5 relative">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Cliente</label>
                                <input
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                    placeholder="BUSCAR CLIENTE..."
                                    required
                                    value={manualOrder.cliente}
                                    onChange={(e) => setManualOrder({ ...manualOrder, cliente: e.target.value.toUpperCase() })}
                                    onFocus={() => setShowSuggestions({ ...showSuggestions, cliente: true })}
                                    onBlur={() => setTimeout(() => setShowSuggestions({ ...showSuggestions, cliente: false }), 200)}
                                />
                                {showSuggestions.cliente && (
                                    <div className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-xl shadow-xl max-h-40 overflow-y-auto no-scrollbar">
                                        {suggestions.clientes
                                            .filter(c => c.toUpperCase().includes(manualOrder.cliente.toUpperCase()))
                                            .slice(0, 5)
                                            .map(c => (
                                                <button key={c} type="button" onClick={() => setManualOrder({ ...manualOrder, cliente: c })} className="w-full text-left p-3 text-[10px] font-black uppercase hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--text-main)] border-b border-[var(--border-ui)] last:border-0">{c}</button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 space-y-1.5 relative">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Producto / Descripción</label>
                                <textarea
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase h-24 no-scrollbar"
                                    placeholder="EJ: SOFÁ CAMA GRIS"
                                    required
                                    value={manualOrder.producto}
                                    onChange={(e) => setManualOrder({ ...manualOrder, producto: e.target.value.toUpperCase() })}
                                    onFocus={() => setShowSuggestions({ ...showSuggestions, producto: true })}
                                    onBlur={() => setTimeout(() => setShowSuggestions({ ...showSuggestions, producto: false }), 200)}
                                ></textarea>
                                {showSuggestions.producto && (
                                    <div className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-xl shadow-xl max-h-40 overflow-y-auto no-scrollbar">
                                        {suggestions.productos
                                            .filter(p => p.toUpperCase().includes(manualOrder.producto.toUpperCase()))
                                            .slice(0, 5)
                                            .map(p => (
                                                <button key={p} type="button" onClick={() => setManualOrder({ ...manualOrder, producto: p })} className="w-full text-left p-3 text-[10px] font-black uppercase hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--text-main)] border-b border-[var(--border-ui)] last:border-0">{p}</button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="col-span-1 space-y-1.5">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Cantidad</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all"
                                    required
                                    min="1"
                                    value={manualOrder.cantidad}
                                    onChange={(e) => setManualOrder({ ...manualOrder, cantidad: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="col-span-1 space-y-1.5 relative">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Transportadora</label>
                                <input
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                    value={manualOrder.transportadora}
                                    onChange={(e) => setManualOrder({ ...manualOrder, transportadora: e.target.value.toUpperCase() })}
                                    onFocus={() => setShowSuggestions({ ...showSuggestions, transportadora: true })}
                                    onBlur={() => setTimeout(() => setShowSuggestions({ ...showSuggestions, transportadora: false }), 200)}
                                />
                                {showSuggestions.transportadora && (
                                    <div className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-xl shadow-xl max-h-40 overflow-y-auto no-scrollbar">
                                        {suggestions.transportadoras
                                            .filter(t => t.toUpperCase().includes(manualOrder.transportadora.toUpperCase()))
                                            .slice(0, 5)
                                            .map(t => (
                                                <button key={t} type="button" onClick={() => setManualOrder({ ...manualOrder, transportadora: t })} className="w-full text-left p-3 text-[10px] font-black uppercase hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--text-main)] border-b border-[var(--border-ui)] last:border-0">{t}</button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <input
                                    type="checkbox"
                                    id="manualPrioridad"
                                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500"
                                    checked={manualOrder.prioridad}
                                    onChange={(e) => setManualOrder({ ...manualOrder, prioridad: e.target.checked })}
                                />
                                <label htmlFor="manualPrioridad" className="font-black text-blue-800 dark:text-blue-400 text-[10px] uppercase cursor-pointer">Marcar como PRIORITARIO</label>
                            </div>

                            <div className="col-span-2 flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl hover:bg-[var(--border-ui)] transition-all uppercase text-[10px]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-[10px]"
                                >
                                    Crear Pedido
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Worker Modal Armonizado */}
            {isWorkerModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[2.5rem] p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-600 rounded-xl text-white">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">
                                {editingWorker ? 'Editar Operario' : 'Nuevo Operario'}
                            </h2>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const dataToSave = {
                                nombre: workerFormData.nombre.toUpperCase(),
                                cargo: workerFormData.cargo,
                                pin: workerFormData.pin || '0000',
                                rol: workerFormData.rol || 'OPERARIO'
                            };
                            if (editingWorker) {
                                const { error } = await supabase.from('operarios').update(dataToSave).eq('id', editingWorker.id);
                                if (!error) { toast.success('OPERARIO ACTUALIZADO'); setIsWorkerModalOpen(false); fetchWorkers(); }
                            } else {
                                const { error } = await supabase.from('operarios').insert([dataToSave]);
                                if (!error) { toast.success('OPERARIO AGREGADO'); setIsWorkerModalOpen(false); fetchWorkers(); }
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    autoFocus
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                    placeholder="EJ: JUAN PEREZ"
                                    value={workerFormData.nombre}
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, nombre: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Cargo</label>
                                    <select
                                        className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all"
                                        value={workerFormData.cargo}
                                        onChange={(e) => setWorkerFormData({ ...workerFormData, cargo: e.target.value })}
                                    >
                                        <option value="Tapicero">Tapicero</option>
                                        <option value="Costurero">Costurero</option>
                                        <option value="Armado">Armado</option>
                                        <option value="Corte">Corte</option>
                                        <option value="Logística">Logística</option>
                                        <option value="Admin">Administrativo</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Rol de Sistema</label>
                                    <select
                                        className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all"
                                        value={workerFormData.rol}
                                        onChange={(e) => setWorkerFormData({ ...workerFormData, rol: e.target.value })}
                                    >
                                        <option value="OPERARIO">OPERARIO</option>
                                        <option value="BODEGUERO">BODEGUERO</option>
                                        <option value="DESPACHADOR">DESPACHADOR</option>
                                        <option value="SUPERVISOR">SUPERVISOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 text-blue-600">PIN de Acceso (4 dígitos)</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    minLength={4}
                                    className="w-full p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl font-black text-center text-xl tracking-[1em] text-blue-600 outline-none focus:border-blue-500 transition-all"
                                    placeholder="0000"
                                    value={workerFormData.pin}
                                    required
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsWorkerModalOpen(false)} className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl uppercase text-[10px]">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-[10px]">{editingWorker ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Catalog Item Modal Armonizado */}
            {isCatalogModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-[2.5rem] p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-600 rounded-xl text-white">
                                {catalogType === 'cliente' ? <Users size={20} /> : <Package size={20} />}
                            </div>
                            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">
                                Nuevo {catalogType}
                            </h2>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const table = catalogType === 'cliente' ? 'clientes' : 'productos';
                            const { error } = await supabase.from(table).insert([{ nombre: catalogItemName.toUpperCase() }]);
                            if (!error) {
                                toast.success('GUARDADO CON ÉXITO');
                                setIsCatalogModalOpen(false);
                                fetchCatalogos();
                            } else {
                                console.error('Error catálogo:', error);
                                if (error.code === '23505') {
                                    toast.error('REGISTRO YA EXISTE');
                                } else {
                                    toast.error('ERROR AL GUARDAR');
                                }
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Descripción / Nombre</label>
                                <input
                                    autoFocus
                                    required
                                    className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-ui)] rounded-2xl font-black text-xs text-[var(--text-main)] outline-none focus:border-blue-500 transition-all uppercase"
                                    placeholder="EJ: NOMBRE ..."
                                    value={catalogItemName}
                                    onChange={(e) => setCatalogItemName(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsCatalogModalOpen(false)} className="flex-1 py-4 bg-[var(--bg-input)] text-[var(--text-muted)] font-black rounded-2xl uppercase text-[10px]">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-[10px]">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Exportación Armonizado */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-ui)] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--border-ui)] flex items-center justify-between bg-[var(--bg-input)]/30">
                            <h3 className="font-black text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-tighter">
                                <Download className="text-emerald-500" size={18} />
                                Exportar Catálogos
                            </h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">Incluir en el archivo:</p>

                            {[
                                { id: 'includeWorkers', label: 'Equipo de Trabajo', icon: Users, color: 'text-blue-500' },
                                { id: 'includeClients', label: 'Clientes', icon: Users, color: 'text-purple-500' },
                                { id: 'includeProducts', label: 'Productos', icon: Package, color: 'text-orange-500' }
                            ].map(opt => (
                                <label key={opt.id} className="flex items-center gap-3 p-4 bg-[var(--bg-input)]/50 rounded-2xl cursor-pointer hover:bg-[var(--bg-input)] transition-all border border-transparent hover:border-emerald-500/20">
                                    <input
                                        type="checkbox"
                                        checked={exportOptions[opt.id]}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                                        className="w-5 h-5 rounded-lg border-[var(--border-ui)] bg-transparent text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div className="flex items-center gap-2 text-[var(--text-main)] font-black text-[10px] uppercase">
                                        <opt.icon size={16} className={opt.color} />
                                        {opt.label}
                                    </div>
                                </label>
                            ))}

                            <button
                                onClick={() => {
                                    exportConfigToExcel(exportOptions);
                                    setIsExportModalOpen(false);
                                }}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                                <Download size={16} />
                                Descargar Catálogos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
