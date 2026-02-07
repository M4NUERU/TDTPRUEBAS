import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Package, Plus, Minus, Search, Trash2, RefreshCw, Layers, Download, Upload, Info } from 'lucide-react';
import { parseInsumosExcel } from '../utils/excelParser';
import { exportInsumosExcel } from '../utils/excelExport';

const Inventarios = () => {
    const [items, setItems] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('MODULOS'); // MODULOS | INSUMOS
    const [typeFilter, setTypeFilter] = useState('COSTURA');
    const [newItem, setNewItem] = useState({ nombre: '', cantidad: 0, tipo: 'COSTURA' });
    const [newInsumo, setNewInsumo] = useState({ nombre: '', cantidad: 0, unidad_medida: 'Metros', observaciones: '' });
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        // Fetch Modulos
        const { data: modData } = await supabase.from('inventario_modulos').select('*').order('nombre');
        setItems(modData || []);

        // Fetch Insumos
        const { data: insData } = await supabase.from('inventario_insumos').select('*').order('nombre');
        setInsumos(insData || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleUpdateQuantity = async (table, id, delta) => {
        const list = table === 'inventario_modulos' ? items : insumos;
        const setter = table === 'inventario_modulos' ? setItems : setInsumos;
        const item = list.find(i => i.id === id);
        const newQty = Math.max(0, parseFloat(item.cantidad) + delta);

        const { error } = await supabase
            .from(table)
            .update({ cantidad: newQty, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) toast.error('Error al actualizar');
        else {
            setter(list.map(i => i.id === id ? { ...i, cantidad: newQty } : i));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const table = activeTab === 'MODULOS' ? 'inventario_modulos' : 'inventario_insumos';
        const data = activeTab === 'MODULOS' ? { ...newItem, nombre: newItem.nombre.toUpperCase() } : { ...newInsumo, nombre: newInsumo.nombre.toUpperCase() };

        if (!data.nombre) return toast.error('Nombre obligatorio');

        const { error } = await supabase.from(table).insert([data]);

        if (error) toast.error('Error al guardar');
        else {
            toast.success('Agregado exitosamente');
            setIsAddOpen(false);
            setNewItem({ nombre: '', cantidad: 0, tipo: typeFilter });
            setNewInsumo({ nombre: '', cantidad: 0, unidad_medida: 'Metros', observaciones: '' });
            fetchInventory();
        }
    };

    const handleDelete = async (table, id) => {
        if (!confirm('¿Borrar este item del inventario?')) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) toast.error('Error al eliminar');
        else fetchInventory();
    };

    const handleImportInsumos = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await parseInsumosExcel(file);
            if (data.length === 0) return toast.error('No se encontraron datos válidos');

            const { error } = await supabase.from('inventario_insumos').insert(data);
            if (error) throw error;

            toast.success(`${data.length} insumos importados`);
            fetchInventory();
        } catch (err) {
            console.error(err);
            toast.error('Error al importar');
        }
    };

    const filteredModulos = items.filter(i =>
        i.tipo === typeFilter &&
        (i.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredInsumos = insumos.filter(i =>
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 w-full max-w-[98%] mx-auto pb-32 dark:bg-[#0a0f18] transition-colors duration-300">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                        <Package className="text-blue-600 dark:text-blue-500" size={32} /> Inventarios
                    </h1>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setActiveTab('MODULOS')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MODULOS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            Módulos (Producción)
                        </button>
                        <button
                            onClick={() => setActiveTab('INSUMOS')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'INSUMOS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            Insumos (Materiales)
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {activeTab === 'INSUMOS' && (
                        <>
                            <button
                                onClick={() => exportInsumosExcel(insumos)}
                                className="flex-1 md:flex-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <Download size={18} /> EXPORTAR
                            </button>
                            <div className="relative flex-1 md:flex-none">
                                <input type="file" onChange={handleImportInsumos} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <button className="w-full bg-slate-800 dark:bg-slate-700 text-white px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg">
                                    <Upload size={18} /> IMPORTAR
                                </button>
                            </div>
                        </>
                    )}
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex-1 md:flex-none bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        <Plus size={20} /> AGREGAR {activeTab === 'MODULOS' ? 'MODELO' : 'INSUMO'}
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="bg-white dark:bg-[#141b2b] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[60vh] transition-colors">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={16} />
                        <input
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#0a0f18] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder={`Buscar en ${activeTab.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'MODULOS' && (
                        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
                            <button
                                onClick={() => setTypeFilter('COSTURA')}
                                className={`flex-1 md:px-6 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${typeFilter === 'COSTURA' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                🧵 COSTURA
                            </button>
                            <button
                                onClick={() => setTypeFilter('CARPINTERIA')}
                                className={`flex-1 md:px-6 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${typeFilter === 'CARPINTERIA' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                🪑 CARPINTERÍA
                            </button>
                        </div>
                    )}
                </div>

                {activeTab === 'MODULOS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-0 divide-y md:divide-y-0 border-b border-slate-100 dark:border-slate-800">
                        {filteredModulos.map((item) => (
                            <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group border-r border-b border-slate-50 dark:border-slate-800/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="max-w-[80%]">
                                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-xs leading-tight line-clamp-2">{item.nombre}</h3>
                                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block">Stock Disponible</span>
                                    </div>
                                    <button onClick={() => handleDelete('inventario_modulos', item.id)} className="text-slate-200 dark:text-slate-700 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between bg-white dark:bg-[#0a0f18] rounded-2xl p-2 border border-slate-100 dark:border-slate-800 group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-all shadow-sm">
                                    <button
                                        onClick={() => handleUpdateQuantity('inventario_modulos', item.id, -1)}
                                        className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">{item.cantidad}</span>
                                    <button
                                        onClick={() => handleUpdateQuantity('inventario_modulos', item.id, 1)}
                                        className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 active:scale-90 transition-all hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-800/10 text-left border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Insumo / Producto</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Unidad</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Cantidad</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Observaciones</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredInsumos.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="p-4">
                                            <p className="font-black text-slate-700 dark:text-white uppercase text-xs tracking-tight">{item.nombre}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{item.unidad_medida || 'Metros'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <button onClick={() => handleUpdateQuantity('inventario_insumos', item.id, -1)} className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors"><Minus size={14} /></button>
                                                <span className={`text-sm font-black w-12 text-center ${item.cantidad === 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-800 dark:text-white'}`}>{item.cantidad}</span>
                                                <button onClick={() => handleUpdateQuantity('inventario_insumos', item.id, 1)} className="text-slate-300 dark:text-slate-700 hover:text-blue-600 transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight line-clamp-1 italic">{item.observaciones || '-'}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete('inventario_insumos', item.id)} className="text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(activeTab === 'MODULOS' ? filteredModulos : filteredInsumos).length === 0 && (
                    <div className="py-20 text-center text-slate-300 dark:text-slate-700 font-bold uppercase italic border-2 border-dashed border-slate-50 dark:border-slate-800/20 m-6 rounded-[2rem]">
                        {loading ? 'Cargando inventario...' : 'No se encontraron registros'}
                    </div>
                )}
            </div>

            {/* Modal Agregar */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#141b2b] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">Nuevo {activeTab === 'MODULOS' ? 'Modelo' : 'Insumo'}</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    autoFocus
                                    className="w-full p-4 bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors uppercase"
                                    placeholder="EJ: TELA JACQUARD GRIS"
                                    value={activeTab === 'MODULOS' ? newItem.nombre : newInsumo.nombre}
                                    onChange={(e) => activeTab === 'MODULOS' ? setNewItem({ ...newItem, nombre: e.target.value }) : setNewInsumo({ ...newInsumo, nombre: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Cantidad</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                        value={activeTab === 'MODULOS' ? newItem.cantidad : newInsumo.cantidad}
                                        onChange={(e) => activeTab === 'MODULOS' ? setNewItem({ ...newItem, cantidad: parseFloat(e.target.value) }) : setNewInsumo({ ...newInsumo, cantidad: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                        {activeTab === 'MODULOS' ? 'Categoría' : 'Unidad'}
                                    </label>
                                    {activeTab === 'MODULOS' ? (
                                        <select
                                            className="w-full p-4 bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                            value={newItem.tipo}
                                            onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })}
                                        >
                                            <option value="COSTURA">🧵 COSTURA</option>
                                            <option value="CARPINTERIA">🪑 CARPINTERÍA</option>
                                        </select>
                                    ) : (
                                        <input
                                            className="w-full p-4 bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors uppercase"
                                            placeholder="Metros, Und, etc."
                                            value={newInsumo.unidad_medida}
                                            onChange={(e) => setNewInsumo({ ...newInsumo, unidad_medida: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            {activeTab === 'INSUMOS' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Observaciones</label>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors min-h-[80px]"
                                        value={newInsumo.observaciones}
                                        onChange={(e) => setNewInsumo({ ...newInsumo, observaciones: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-xs">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 dark:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-100 dark:shadow-blue-900/20 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all uppercase text-xs">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventarios;
