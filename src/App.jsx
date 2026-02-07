import React, { useState, useEffect, Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Login from './components/Login';

// Lazy load pages
const Admin = lazy(() => import('./pages/Admin'));
const Despacho = lazy(() => import('./pages/Despacho'));
const Planta = lazy(() => import('./pages/Planta'));
const Bodega = lazy(() => import('./pages/Bodega'));
const Finanzas = lazy(() => import('./pages/Finanzas'));
const Personal = lazy(() => import('./pages/Personal'));

import {
  LayoutDashboard, Truck, Factory, Warehouse, Users,
  Package, LogOut, ChevronRight, UserCircle, AlertTriangle,
  Sun, Moon, DollarSign, Settings
} from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
  if (!userRole) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

const HomeBasedOnRole = ({ role }) => {
  if (['ADMIN', 'SUPERVISOR', 'DESPACHADOR'].includes(role)) return <Navigate to="/admin" replace />;
  if (role === 'OPERARIO') return <Navigate to="/planta" replace />;
  if (role === 'BODEGUERO') return <Navigate to="/bodega" replace />;
  return <div className="p-10 text-center font-black uppercase text-red-500">Error de Rol</div>;
};

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to}>
    {({ isActive }) => (
      <div className={`flex flex-col items-center gap-1.5 transition-all group ${isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] font-bold hover:text-[var(--brand)]'}`}>
        <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[var(--brand)]/10 dark:bg-[var(--brand)]/20 scale-110 shadow-sm' : 'group-hover:scale-110'}`}>
          {React.cloneElement(icon, { size: 22, strokeWidth: isActive ? 3 : 2 })}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60 italic'}`}>{label}</span>
      </div>
    )}
  </NavLink>
);

import Sidebar from './components/Sidebar';

const App = () => {
  const { user, setUser, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const role = user?.rol;

  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-main)] font-sans transition-colors duration-300">
        <Toaster position="top-center" richColors />

        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="flex">
            <Sidebar />

            <div className="flex-1 w-full md:pl-64 min-h-screen pb-24 md:pb-8 transition-all duration-300">
              <div className="max-w-[98%] mx-auto py-4 md:py-8">
                <Suspense fallback={<div className="flex h-[80vh] items-center justify-center font-black uppercase text-slate-400 animate-pulse">Cargando Módulo...</div>}>
                  <Routes>
                    <Route path="/" element={<HomeBasedOnRole role={role} />} />
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'DESPACHADOR']} userRole={role}>
                        <Admin isDark={isDark} toggleTheme={toggle} />
                      </ProtectedRoute>
                    } />
                    <Route path="/planta" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OPERARIO']} userRole={role}>
                        <Planta />
                      </ProtectedRoute>
                    } />
                    <Route path="/bodega" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'BODEGUERO']} userRole={role}>
                        <Bodega />
                      </ProtectedRoute>
                    } />
                    <Route path="/despacho" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'DESPACHADOR']} userRole={role}>
                        <Despacho />
                      </ProtectedRoute>
                    } />
                    <Route path="/finanzas" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR']} userRole={role}>
                        <Finanzas />
                      </ProtectedRoute>
                    } />
                    <Route path="/personal" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'OPERARIO', 'BODEGUERO', 'DESPACHADOR']} userRole={role}>
                        <Personal />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </div>

            {/* Bottom Navigation - Only Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/80 backdrop-blur-xl border-t border-[var(--border-ui)] px-6 py-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem] md:hidden">
              {['ADMIN', 'SUPERVISOR'].includes(role) && (
                <>
                  <NavItem to="/admin" icon={<LayoutDashboard />} label="Admin" />
                  <NavItem to="/planta" icon={<Factory />} label="Planta" />
                  <NavItem to="/bodega" icon={<Warehouse />} label="Bodega" />
                  <NavItem to="/despacho" icon={<Truck />} label="Despacho" />
                </>
              )}
              {role === 'DESPACHADOR' && (
                <>
                  <NavItem to="/admin" icon={<LayoutDashboard />} label="Pedidos" />
                  <NavItem to="/despacho" icon={<Truck />} label="Despacho" />
                </>
              )}
              {role === 'BODEGUERO' && (
                <NavItem to="/bodega" icon={<Warehouse />} label="Bodega" />
              )}
              {role === 'OPERARIO' && (
                <NavItem to="/planta" icon={<Factory />} label="Planta" />
              )}

              <NavItem to="/personal" icon={<UserCircle />} label="Personal" />

              <button
                onClick={logout}
                className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-red-500 active:scale-90 transition-all ml-2"
              >
                <div className="p-1">
                  <LogOut size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Salir</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
