import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
    Warehouse, Plus, Minus, AlertCircle, RefreshCw, Search,
    Package, Layers, Edit, Trash2, X, Check, Save, Download, Upload,
    ChevronDown, Filter, MoreHorizontal
} from 'lucide-react';
import { parseInsumosExcel } from '../utils/excelParser';
import { exportInsumosExcel } from '../utils/excelExport';

const CATEGORIES = [
    { id: 'TODOS', label: 'TODOS' },
    { id: 'TELAS', label: 'TELAS Y TEXTILES' },
    { id: 'ESPUMAS', label: 'ESPUMAS' },
    { id: 'PATAS', label: 'PATAS' },
    { id: 'HERRAJES', label: 'HERRAJES' },
    { id: 'OTROS', label: 'OTROS' },
    { id: 'MODULOS', label: 'MÓDULOS' }
];

const Bodega = () => {
    // --- Auth & Permissions ---
    const user = JSON.parse(localStorage.getItem('todotejidos_user') || '{}');
    const isAdmin = user.rol === 'ADMIN';
    const canEdit = ['ADMIN', 'SUPERVISOR', 'BODEGUERO'].includes(user.rol);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: 0,
        unidad_medida: 'Metros',
        categoria: 'TELAS',
        observaciones: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventario_insumos')
                .select('*')
                .order('nombre');

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            toast.error('Error al conectar con la base de datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStock = async (id, delta) => {
        const item = items.find(i => i.id === id);
        const newQty = Math.max(0, parseFloat(item.cantidad) + delta);

        const { error } = await supabase
            .from('inventario_insumos')
            .update({ cantidad: newQty, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            setItems(items.map(i => i.id === id ? { ...i, cantidad: newQty } : i));
        } else {
            toast.error('Error al actualizar');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            nombre: formData.nombre.toUpperCase(),
            updated_at: new Date().toISOString()
        };

        try {
            if (editingItem) {
                const { error } = await supabase.from('inventario_insumos').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                toast.success('Actualizado correctamente');
            } else {
                const { error } = await supabase.from('inventario_insumos').insert([payload]);
                if (error) throw error;
                toast.success('Agregado correctamente');
            }
            setShowMaterialModal(false);
            setEditingItem(null);
            fetchData();
        } catch (err) {
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Borrar permanentemente?')) return;
        const { error } = await supabase.from('inventario_insumos').delete().eq('id', id);
        if (!error) {
            toast.success('Eliminado');
            fetchData();
        }
    };

    const filteredItems = useMemo(() => {
        let result = items.filter(i =>
            i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (activeCategory !== 'TODOS') {
            result = result.filter(i => i.categoria === activeCategory);
        }

        // Alertas primero: cantidad <= 5 o stock_minimo
        return result.sort((a, b) => {
            const aAlert = a.cantidad <= (a.stock_minimo || 5);
            const bAlert = b.cantidad <= (b.stock_minimo || 5);
            if (aAlert && !bAlert) return -1;
            if (!aAlert && bAlert) return 1;
            return a.nombre.localeCompare(b.nombre);
        });
    }, [items, searchTerm, activeCategory]);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header Compacto */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-4 py-6 sticky top-0 z-30">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Warehouse size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase dark:text-white">BODEGA</h1>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
                        <div className="relative flex-1 min-w-[140px] md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-500 transition-all dark:text-white"
                                placeholder="BUSCAR INSUMO..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchData} className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] rounded-xl">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {canEdit && (
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setFormData({ nombre: '', cantidad: 0, unidad_medida: 'Metros', categoria: 'TELAS', observaciones: '' });
                                    setShowMaterialModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} /> AGREGAR
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtros Profesionales */}
                <div className="max-w-[98%] mx-auto mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-ui)] hover:border-blue-400'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-[98%] mx-auto p-4">
                {/* Vista de Tabla Compacta con Scroll Horizontal en Móvil */}
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-ui)] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
                        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                            <thead>
                                <tr className="bg-[var(--bg-input)] border-b border-[var(--border-ui)]">
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-[var(--text-muted)]">Insumo / Especiales</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-[var(--text-muted)] w-20">Unidad</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-[var(--text-muted)] w-36">Stock</th>
                                    <th className="px-4 py-3 text-[9px] font-black uppercase text-[var(--text-muted)] w-32 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-ui)]">
                                {filteredItems.map(item => {
                                    const isLow = item.cantidad <= (item.stock_minimo || 5);
                                    return (
                                        <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isLow ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-black text-xs uppercase dark:text-white leading-tight">{item.nombre}</span>
                                                        <span className="text-[7px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded uppercase tracking-tighter border border-slate-200 dark:border-slate-600">
                                                            {item.categoria}
                                                        </span>
                                                        {isLow && <span className="text-[8px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-black">BAJO</span>}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic mt-1 line-clamp-1">{item.observaciones || 'General'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">{item.unidad_medida}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 bg-[var(--bg-input)]/50 p-1 rounded-xl w-fit">
                                                    <button
                                                        onClick={() => handleUpdateStock(item.id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[var(--text-muted)] transition-colors active:scale-90"
                                                    >
                                                        <Minus size={14} strokeWidth={3} />
                                                    </button>
                                                    <span className={`text-xs font-black min-w-[2rem] text-center ${isLow ? 'text-red-600 dark:text-red-400' : 'dark:text-white'}`}>
                                                        {item.cantidad}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateStock(item.id, 1)}
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
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setFormData({
                                                                    nombre: item.nombre,
                                                                    cantidad: item.cantidad,
                                                                    unidad_medida: item.unidad_medida,
                                                                    categoria: item.categoria || 'TELAS',
                                                                    observaciones: item.observaciones || ''
                                                                });
                                                                setShowMaterialModal(true);
                                                            }}
                                                            className="p-2 text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {isAdmin && (
                                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center text-[var(--text-muted)]">
                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-black text-[10px] uppercase tracking-widest">No se encontraron insumos</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Edición/Creación */}
            {showMaterialModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-[var(--bg-card)] w-full max-w-lg rounded-3xl p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">{editingItem ? 'Editar' : 'Nuevo'} Insumo</h2>
                            <button type="button" onClick={() => setShowMaterialModal(false)} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Nombre</label>
                                <input required className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none border border-transparent focus:border-blue-500 dark:text-white" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Categoría</label>
                                    <select className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}>
                                        {CATEGORIES.filter(c => c.id !== 'TODOS').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Unidad</label>
                                    <input className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white" value={formData.unidad_medida} onChange={e => setFormData({ ...formData, unidad_medida: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Observaciones / Especificaciones</label>
                                <textarea className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold text-xs outline-none dark:text-white h-24 resize-none" value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">
                            Guardar Cambios
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Bodega;
