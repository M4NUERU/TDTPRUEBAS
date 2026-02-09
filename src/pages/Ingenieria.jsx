import React, { useState, useEffect } from 'react';
import { useEngineering } from '../hooks/useEngineering';
import { useInventory } from '../hooks/useInventory';
import { Plus, Search, Box, Layers, Archive, Save, X, ChevronRight, Calculator } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const Ingenieria = () => {
    const { products, loading, saveProduct, fetchRecipes, saveRecipe } = useEngineering();
    const { items: inventoryItems } = useInventory(); // To select ingredients

    // UI State
    const [view, setView] = useState('CATALOGO'); // CATALOGO, DETALLE_PRODUCTO
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCompany, setActiveCompany] = useState('ALL'); // ALL, TODOTEJIDOS, EMADERA

    // Recipe Builder State
    const [activeRecipe, setActiveRecipe] = useState(null); // If editing specific recipe
    const [recipeForm, setRecipeForm] = useState({ nombre_variante: '' });
    const [recipeIngredients, setRecipeIngredients] = useState([]);

    // --- Product Management ---
    const handleProductSave = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {
            nombre: fd.get('nombre'),
            categoria: fd.get('categoria'),
            empresa: fd.get('empresa'),
            precio_base: fd.get('precio_base')
        };
        const success = await saveProduct(data);
        if (success) setShowProductModal(false);
    };

    // --- Recipe Management ---
    const handleOpenProduct = async (prod) => {
        setSelectedProduct(prod);
        setView('DETALLE_PRODUCTO');
        // Load recipes? Handled in sub-component or effect
    };

    // Filter Products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = activeCompany === 'ALL' || p.empresa === activeCompany || !p.empresa;
        return matchesSearch && matchesCompany;
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-6 py-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-xl text-white">
                            <Box size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Ingeniería de Producto</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Catálogo & Listas de Materiales (BOM)</p>
                        </div>
                    </div>
                    {view === 'CATALOGO' && (
                        <div className="flex gap-2">
                            <select
                                value={activeCompany}
                                onChange={e => setActiveCompany(e.target.value)}
                                className="bg-[var(--bg-input)] font-bold text-xs rounded-xl px-3 outline-none border-none"
                            >
                                <option value="ALL">TODAS LAS EMPRESAS</option>
                                <option value="TODOTEJIDOS">TODO TEJIDOS</option>
                                <option value="EMADERA">E-MADERA</option>
                            </select>
                            <Button onClick={() => setShowProductModal(true)} icon={Plus}>NUEVO PRODUCTO</Button>
                        </div>
                    )}
                    {view === 'DETALLE_PRODUCTO' && (
                        <Button variant="ghost" onClick={() => setView('CATALOGO')}>VOLVER AL CATÁLOGO</Button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {view === 'CATALOGO' ? (
                    <>
                        {/* Search Bar */}
                        <div className="mb-8 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--bg-card)] pl-12 pr-4 py-4 rounded-2xl shadow-sm border-none outline-none font-bold text-[var(--text-main)] placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(prod => (
                                <div
                                    key={prod.id}
                                    onClick={() => handleOpenProduct(prod)}
                                    className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border-ui)] hover:border-purple-500 cursor-pointer transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest text-white ${prod.empresa === 'TODOTEJIDOS' ? 'bg-orange-500' : 'bg-emerald-600'}`}>
                                        {prod.empresa}
                                    </div>
                                    <div className="mb-4 mt-2">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-colors">
                                            <Archive size={24} />
                                        </div>
                                        <h3 className="font-black text-lg text-[var(--text-main)] leading-tight mb-1">{prod.nombre}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{prod.categoria || 'Sin Categoría'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-purple-600 text-xs font-black uppercase mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Gestionar Recetas <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <ProductDetailView
                        product={selectedProduct}
                        inventoryItems={inventoryItems}
                        fetchRecipes={fetchRecipes}
                        saveRecipe={saveRecipe}
                    />
                )}
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleProductSave} className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">Nuevo Producto</h2>
                            <button type="button" onClick={() => setShowProductModal(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <Input name="nombre" label="Nombre del Producto" required placeholder="Ej: Sofá Chester 3P" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoría</label>
                                    <select name="categoria" className="w-full mt-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 font-bold text-xs border border-transparent focus:border-purple-500 outline-none">
                                        <option value="SOFAS">Sofás</option>
                                        <option value="BASECAMAS">Basecamas</option>
                                        <option value="CABECEROS">Cabeceros</option>
                                        <option value="SILLAS">Sillas</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Empresa</label>
                                    <select name="empresa" className="w-full mt-1 bg-[var(--bg-input)] rounded-xl px-4 py-3 font-bold text-xs border border-transparent focus:border-purple-500 outline-none">
                                        <option value="TODOTEJIDOS">TodoTejidos</option>
                                        <option value="EMADERA">E-Madera</option>
                                    </select>
                                </div>
                            </div>
                            <Input name="precio_base" label="Precio Base (Referencia)" type="number" />
                        </div>
                        <Button type="submit" className="w-full mt-8" size="lg">Guardar Producto</Button>
                    </form>
                </div>
            )}
        </div>
    );
};

// Sub-component for managing recipes of a specific product
const ProductDetailView = ({ product, inventoryItems, fetchRecipes, saveRecipe }) => {
    const [recipes, setRecipes] = useState([]);
    const [activeRecipe, setActiveRecipe] = useState(null); // null = list mode, obj = edit mode

    // Recipe Editor State
    const [editorForm, setEditorForm] = useState({ nombre_variante: '' });
    const [lines, setLines] = useState([]); // [{ insumo_id, cantidad, unidad_medida }]

    useEffect(() => {
        loadRecipes();
    }, [product]);

    const loadRecipes = async () => {
        const data = await fetchRecipes(product.id);
        setRecipes(data);
    };

    const handleNewRecipe = () => {
        setEditorForm({ nombre_variante: '' });
        setLines([]);
        setActiveRecipe({ isNew: true });
    };

    const handleEditRecipe = (rec) => {
        setEditorForm({ nombre_variante: rec.nombre_variante, id: rec.id });
        setLines(rec.recetas_insumos.map(ri => ({
            insumo_id: ri.insumo_id,
            cantidad: ri.cantidad,
            unidad_medida: ri.unidad_medida,
            _tempName: ri.inventario_insumos?.nombre // Helper for display
        })));
        setActiveRecipe(rec);
    };

    const handleAddLine = () => {
        setLines([...lines, { insumo_id: '', cantidad: 0, unidad_medida: 'UNIDAD' }]);
    };

    const handleUpdateLine = (idx, field, val) => {
        const newLines = [...lines];
        newLines[idx][field] = val;
        setLines(newLines);
    };

    const handleRemoveLine = (idx) => {
        setLines(lines.filter((_, i) => i !== idx));
    };

    const handleSaveRecipe = async () => {
        if (!editorForm.nombre_variante) return toast.error('Nombre de variante requerido');

        const payload = {
            producto_id: product.id,
            nombre_variante: editorForm.nombre_variante,
            ...(activeRecipe.id && { id: activeRecipe.id })
        };

        const success = await saveRecipe(payload, lines);
        if (success) {
            setActiveRecipe(null);
            loadRecipes();
        }
    };

    if (activeRecipe) {
        // --- RECIPE EDITOR ---
        return (
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-ui)] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 border-b border-[var(--border-ui)] flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-black uppercase text-[var(--text-main)] italic">Editor de Receta (BOM)</h2>
                        <p className="text-xs text-slate-400 font-bold">{product.nombre}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setActiveRecipe(null)}>Cancelar</Button>
                        <Button icon={Save} onClick={handleSaveRecipe}>GUARDAR RECETA</Button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="max-w-md mb-8">
                        <Input
                            label="Nombre de la Variante"
                            placeholder="Ej: Tela Lino Gris + Patas Madera"
                            value={editorForm.nombre_variante}
                            onChange={val => setEditorForm({ ...editorForm, nombre_variante: val })}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase text-sm text-slate-500">Lista de Materiales</h3>
                            <Button size="sm" variant="secondary" icon={Plus} onClick={handleAddLine}>Agregar Insumo</Button>
                        </div>

                        <div className="space-y-2">
                            {lines.map((line, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <select
                                            className="w-full bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                            value={line.insumo_id}
                                            onChange={e => handleUpdateLine(idx, 'insumo_id', e.target.value)}
                                        >
                                            <option value="">Seleccionar Insumo...</option>
                                            {inventoryItems.map(item => (
                                                <option key={item.id} value={item.id}>{item.nombre} ({item.codigo})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            className="w-full bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                            placeholder="Cant."
                                            value={line.cantidad}
                                            onChange={e => handleUpdateLine(idx, 'cantidad', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <select
                                            className="w-full bg-[var(--bg-input)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
                                            value={line.unidad_medida}
                                            onChange={e => handleUpdateLine(idx, 'unidad_medida', e.target.value)}
                                        >
                                            <option value="UNIDAD">UND</option>
                                            <option value="METRO">MTR</option>
                                            <option value="KILO">KG</option>
                                            <option value="ROLLO">ROLLO</option>
                                            <option value="LAMINA">LAMINA</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleRemoveLine(idx)} className="text-red-400 hover:text-red-500 p-2"><X size={16} /></button>
                                </div>
                            ))}
                            {lines.length === 0 && <p className="text-center text-xs italic text-slate-400 py-4">No hay materiales agregados a esta receta.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RECIPE LIST ---
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-ui)] shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white mb-2 ${product.empresa === 'TODOTEJIDOS' ? 'bg-orange-500' : 'bg-emerald-600'}`}>
                            {product.empresa}
                        </div>
                        <h2 className="text-4xl font-black text-[var(--text-main)] uppercase italic tracking-tighter mb-2">{product.nombre}</h2>
                        <p className="text-slate-400 font-bold uppercase">{product.categoria}</p>
                    </div>
                    <Button icon={Plus} onClick={handleNewRecipe}>NUEVA RECETA</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-[var(--bg-card)] rounded-3xl border border-dashed border-slate-700">
                        <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-bold">Este producto aún no tiene recetas de fabricación.</p>
                    </div>
                ) : (
                    recipes.map(rec => (
                        <div key={rec.id} className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-ui)] hover:border-purple-500 transition-all flex flex-col justify-between">
                            <div>
                                <h3 className="font-black text-xl text-[var(--text-main)] mb-2">{rec.nombre_variante}</h3>
                                <div className="space-y-1 mb-4">
                                    {rec.recetas_insumos?.slice(0, 3).map(ri => (
                                        <div key={ri.id} className="flex justify-between text-xs text-slate-500 font-bold">
                                            <span>• {ri.inventario_insumos?.nombre || 'Insumo Eliminado'}</span>
                                            <span>{ri.cantidad} {ri.unidad_medida}</span>
                                        </div>
                                    ))}
                                    {(rec.recetas_insumos?.length || 0) > 3 && <p className="text-[10px] text-purple-500 font-black pt-1">... y {rec.recetas_insumos.length - 3} más</p>}
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => handleEditRecipe(rec)}>EDITAR RECETA</Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Ingenieria;
