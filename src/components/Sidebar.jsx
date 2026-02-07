import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
    LayoutDashboard, Truck, Factory, Warehouse, Users,
    LogOut, UserCircle, Sun, Moon, DollarSign, ShieldCheck
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink to={to} className="w-full">
        {({ isActive }) => (
            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                ${isActive
                    ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)]'}
            `}>
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {label}
                </span>
                {badge && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
            </div>
        )}
    </NavLink>
);

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const { isDark, toggle } = useThemeStore();
    const role = user?.rol;

    const isAdmin = ['ADMIN', 'SUPERVISOR'].includes(role);

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-card)]/80 backdrop-blur-xl border-r border-[var(--border-ui)] flex flex-col z-40 hidden md:flex transition-colors duration-300">
            {/* Logo Section */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-[var(--brand)] rounded-2xl text-white shadow-lg shadow-[var(--brand)]/30">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-[var(--text-main)]">
                            TODOTEJIDOS
                        </h1>
                        <span className="text-[10px] font-bold text-[var(--brand)] tracking-widest uppercase">
                            Manager Pro
                        </span>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="space-y-2">
                    {isAdmin && (
                        <>
                            <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                            <SidebarItem to="/planta" icon={Factory} label="Planta" />
                            <SidebarItem to="/bodega" icon={Warehouse} label="Bodega" />
                            <SidebarItem to="/despacho" icon={Truck} label="Despacho" />
                            <SidebarItem to="/finanzas" icon={DollarSign} label="Contador" />
                        </>
                    )}
                    {role === 'DESPACHADOR' && (
                        <>
                            <SidebarItem to="/admin" icon={LayoutDashboard} label="Pedidos" />
                            <SidebarItem to="/despacho" icon={Truck} label="Despacho" />
                        </>
                    )}
                    {role === 'BODEGUERO' && (
                        <SidebarItem to="/bodega" icon={Warehouse} label="Bodega" />
                    )}
                    {role === 'OPERARIO' && (
                        <SidebarItem to="/planta" icon={Factory} label="Planta" />
                    )}

                    <div className="my-4 border-t border-[var(--border-ui)] opacity-30"></div>

                    <SidebarItem to="/personal" icon={UserCircle} label="Personal" />
                </div>
            </div>

            {/* Bottom Section - User & Settings */}
            <div className="mt-auto p-4 border-t border-[var(--border-ui)] bg-[var(--bg-input)]/30">
                <div className="flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-ui)]/50 shadow-sm mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-blue-400 flex items-center justify-center text-white font-black uppercase shadow-sm">
                        {user?.nombre?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[var(--text-main)] truncate uppercase">
                            {user?.nombre || 'Usuario'}
                        </p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                            {user?.rol || 'Visitante'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={toggle}
                        className="flex-1 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-ui)]/50 text-[var(--text-main)] hover:bg-[var(--bg-input)] transition-all flex items-center justify-center gap-2 group shadow-sm"
                    >
                        {isDark ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
                        <span className="text-[10px] font-black uppercase">Tema</span>
                    </button>

                    <button
                        onClick={logout}
                        className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 flex items-center justify-center shadow-sm"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
