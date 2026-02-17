/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useInventory } from '../hooks/useInventory';
import { Warehouse, Plus, RefreshCw, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProductRow } from '../components/features/bodega/ProductRow';
import { MaterialModal } from '../components/features/bodega/MaterialModal';

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
    // Auth
    const user = useAuthStore((state) => state.user);
    const userRole = user?.rol?.toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const canEdit = ['ADMIN', 'SUPERVISOR'].includes(userRole);

    // Logic Hook
    const { items, loading, fetchItems, updateStock, saveItem, deleteItem } = useInventory();

    // Local UI State
    const [activeCategory, setActiveCategory] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // derived state
    const filteredItems = useMemo(() => {
        let result = items.filter(i =>
            i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (activeCategory !== 'TODOS') {
            result = result.filter(i => i.categoria === activeCategory);
        }

        // Sort: Low stock first
        return result.sort((a, b) => {
            const aAlert = a.cantidad <= (a.stock_minimo || 5);
            const bAlert = b.cantidad <= (b.stock_minimo || 5);
            if (aAlert && !bAlert) return -1;
            if (!aAlert && bAlert) return 1;
            return a.nombre.localeCompare(b.nombre);
        });
    }, [items, searchTerm, activeCategory]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-200">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-ui)] px-4 py-6 sticky top-0 z-30">
                <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Warehouse size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase dark:text-white">BODEGA</h1>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
                        <div className="flex-1 min-w-[140px] md:w-64">
                            <Input
                                search
                                placeholder="BUSCAR INSUMO..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                        <Button variant="ghost" onClick={fetchItems} loading={loading} size="icon">
                            <RefreshCw size={20} />
                        </Button>
                        {canEdit && (
                            <Button onClick={handleAddNew} icon={Plus}>
                                AGREGAR
                            </Button>
                        )}
                    </div>
                </div>

                {/* Categories */}
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

            {/* Content */}
            <main className="max-w-[98%] mx-auto p-4">
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
                                {filteredItems.map(item => (
                                    <ProductRow
                                        key={item.id}
                                        item={item}
                                        onUpdateStock={updateStock}
                                        onEdit={handleEdit}
                                        onDelete={deleteItem}
                                        canEdit={canEdit}
                                        isAdmin={isAdmin}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredItems.length === 0 && !loading && (
                        <div className="py-20 text-center text-[var(--text-muted)]">
                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-black text-[10px] uppercase tracking-widest">No se encontraron insumos</p>
                        </div>
                    )}
                </div>
            </main>

            <MaterialModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={saveItem}
                editingItem={editingItem}
            />
        </div>
    );
};

export default Bodega;
