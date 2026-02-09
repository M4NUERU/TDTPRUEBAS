import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export const UserModal = ({ isOpen, onClose, onSave, editingUser }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        username: '',
        pin_acceso: '',
        rol: 'OPERARIO',
        sucursal: 'BODEGA_PRINCIPAL',
        empresa: 'TODOTEJIDOS',
        salario_base: 1300000,
        auxilio_transporte: 162000,
        tipo_contrato: 'INDEFINIDO'
    });

    useEffect(() => {
        if (editingUser) {
            setFormData({ ...editingUser, pin_acceso: '', empresa: editingUser.empresa || 'TODOTEJIDOS' }); // Don't show PIN
        } else {
            setFormData({ nombre: '', username: '', pin_acceso: '', rol: 'OPERARIO', sucursal: 'BODEGA_PRINCIPAL', empresa: 'TODOTEJIDOS', salario_base: 1300000, auxilio_transporte: 162000, tipo_contrato: 'INDEFINIDO' });
        }
    }, [editingUser, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation simple
        if (!editingUser && !formData.pin_acceso) return alert('PIN requerido');

        const payload = { ...formData };
        if (!payload.pin_acceso) delete payload.pin_acceso; // Don't update PIN if empty on edit

        const success = await onSave(payload, !!editingUser);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl p-8 border border-[var(--border-ui)] shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter dark:text-white">{editingUser ? 'Editar' : 'Nuevo'} Usuario</h2>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        value={formData.nombre}
                        onChange={val => setFormData({ ...formData, nombre: val })}
                        required
                    />
                    <Input
                        label="Usuario (Login)"
                        value={formData.username}
                        onChange={val => setFormData({ ...formData, username: val })}
                        required
                    />
                    <Input
                        label={editingUser ? "Nuevo PIN (Opcional)" : "PIN de Acceso"}
                        type="password"
                        value={formData.pin_acceso}
                        onChange={val => setFormData({ ...formData, pin_acceso: val })}
                        required={!editingUser}
                        placeholder="4 dígitos"
                    />

                    <div>
                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Rol</label>
                        <select
                            className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white border border-[var(--border-ui)]"
                            value={formData.rol}
                            onChange={e => setFormData({ ...formData, rol: e.target.value })}
                        >
                            <option value="OPERARIO">OPERARIO</option>
                            <option value="BODEGUERO">BODEGUERO</option>
                            <option value="SUPERVISOR">SUPERVISOR</option>
                            <option value="DESPACHADOR">DESPACHADOR</option>
                            <option value="ADMIN">ADMINISTRADOR</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Empresa</label>
                        <select
                            className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white border border-[var(--border-ui)]"
                            value={formData.empresa}
                            onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                        >
                            <option value="TODOTEJIDOS">TODO TEJIDOS</option>
                            <option value="EMADERA">E-MADERA</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Salario Base"
                            type="number"
                            value={formData.salario_base}
                            onChange={val => setFormData({ ...formData, salario_base: val })}
                        />
                        <Input
                            label="Aux. Transporte"
                            type="number"
                            value={formData.auxilio_transporte}
                            onChange={val => setFormData({ ...formData, auxilio_transporte: val })}
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1 block ml-1">Tipo Contrato</label>
                        <select
                            className="w-full px-4 py-3 bg-[var(--bg-input)] rounded-xl font-bold uppercase text-xs outline-none dark:text-white border border-[var(--border-ui)]"
                            value={formData.tipo_contrato}
                            onChange={e => setFormData({ ...formData, tipo_contrato: e.target.value })}
                        >
                            <option value="INDEFINIDO">INDEFINIDO</option>
                            <option value="FIJO">TÉRMINO FIJO</option>
                            <option value="PRESTACION_SERVICIOS">PRESTACIÓN DE SERVICIOS</option>
                            <option value="OBRA_LABOR">OBRA LABOR</option>
                        </select>
                    </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-8" size="lg">
                    Guardar
                </Button>
            </form>
        </div>
    );
};
