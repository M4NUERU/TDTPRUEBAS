import React from 'react';
import { Edit, Trash2, Key } from 'lucide-react';
import { Badge } from '../../ui/Badge';

export const UserTable = ({ users, onEdit, onDelete, onResetPassword }) => {
    return (
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-ui)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-[var(--bg-input)] border-b border-[var(--border-ui)]">
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Usuario</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Rol</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">Sucursal</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-ui)]">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black text-xs">
                                            {user.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[var(--text-main)] uppercase">{user.nombre}</p>
                                            <p className="text-[9px] text-[var(--text-muted)] uppercase">{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={user.rol === 'ADMIN' ? 'danger' : 'default'}>{user.rol}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase">{user.sucursal || 'GENERAL'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => onResetPassword(user)} className="p-2 text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all" title="Reset PIN">
                                            <Key size={16} />
                                        </button>
                                        <button onClick={() => onEdit(user)} className="p-2 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDelete(user.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
