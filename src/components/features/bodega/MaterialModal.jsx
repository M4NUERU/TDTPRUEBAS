import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const CATEGORIES = [
    { id: 'TELAS', label: 'TELAS Y TEXTILES' },
    { id: 'ESPUMAS', label: 'ESPUMAS' },
    { id: 'PATAS', label: 'PATAS' },
    { id: 'HERRAJES', label: 'HERRAJES' },
    { id: 'OTROS', label: 'OTROS' },
    { id: 'MODULOS', label: 'MÓDULOS' }
];

export const MaterialModal = ({ isOpen, onClose, onSave, editingItem }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: 0,
        unidad_medida: 'Metros',
        categoria: 'TELAS',
        observaciones: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                id: editingItem.id,
                ...editingItem
            });
        } else {
            setFormData({ nombre: '', cantidad: 0, unidad_medida: 'Metros', categoria: 'TELAS', observaciones: '' });
        }
    }, [editingItem, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await onSave(formData, !!editingItem);
        setLoading(false);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] w-full max-w-lg rounded-3xl p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">{editingItem ? 'Editar' : 'Nuevo'} Insumo</h2>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.nombre}
                        onChange={val => setFormData({ ...formData, nombre: val })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Categoría</label>
                            <select
                                className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white border border-[var(--border-ui)]"
                                value={formData.categoria}
                                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <Input
                            label="Unidad"
                            value={formData.unidad_medida}
                            onChange={val => setFormData({ ...formData, unidad_medida: val })}
                        />
                    </div>

                    <div>
                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Observaciones / Especificaciones</label>
                        <textarea
                            className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold text-xs outline-none dark:text-white h-24 resize-none border border-[var(--border-ui)]"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-8" loading={loading} size="lg">
                    Guardar Cambios
                </Button>
            </form>
        </div>
    );
};
