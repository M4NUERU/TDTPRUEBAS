import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Admin from './pages/Admin';
import Despacho from './pages/Despacho';
import Planta from './pages/Planta';
import Bodega from './pages/Bodega';
import Finanzas from './pages/Finanzas';
import Personal from './pages/Personal';
import {
  LayoutDashboard, Truck, Factory, Warehouse, Users,
  Package, LogOut, ChevronRight, UserCircle, AlertTriangle,
  Sun, Moon, DollarSign, Settings
} from 'lucide-react';

// Error Boundary for early debugging
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 text-red-900 text-center">
          <AlertTriangle size={48} className="mb-4 text-red-600" />
          <h1 className="text-xl font-black uppercase mb-2">Error Crítico</h1>
          <p className="text-xs font-bold mb-6 opacity-60 max-w-xs">{this.state.error?.toString()}</p>
          <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px]">Reiniciar App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import Login from './components/Login';

const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
  if (!userRole) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('todotejidos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('todotejidos_theme') === 'dark');

  const role = user?.rol;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('todotejidos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('todotejidos_theme', 'light');
    }
  }, [darkMode]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('todotejidos_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('todotejidos_user');
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f18] pb-24 font-sans transition-colors duration-300">
          <Toaster position="top-center" richColors />

          {!user ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              <div className="w-full max-w-[98%] mx-auto min-h-screen text-slate-900 dark:text-slate-100">
                <Routes>
                  <Route path="/" element={<HomeBasedOnRole role={role} />} />

                  {/* ADMIN & SUPERVISOR */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERVISOR', 'DESPACHADOR']} userRole={role}>
                      <Admin isDark={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />
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
              </div>

              {/* Premium Mobile Navigation */}
              <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#141b2b]/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-around items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem] md:rounded-none transition-all">

                {/* ADMIN/SUPERVISOR Full Access */}
                {['ADMIN', 'SUPERVISOR'].includes(role) && (
                  <>
                    <NavItem to="/admin" icon={<LayoutDashboard />} label="Admin" />
                    <NavItem to="/planta" icon={<Factory />} label="Planta" />
                    <NavItem to="/bodega" icon={<Warehouse />} label="Bodega" />
                    <NavItem to="/despacho" icon={<Truck />} label="Despacho" />
                    <NavItem to="/finanzas" icon={<DollarSign />} label="Contador" />
                  </>
                )}

                {/* DESPACHADOR */}
                {role === 'DESPACHADOR' && (
                  <>
                    <NavItem to="/admin" icon={<LayoutDashboard />} label="Pedidos" />
                    <NavItem to="/despacho" icon={<Truck />} label="Despacho" />
                    <NavItem to="/personal" icon={<UserCircle />} label="Personal" />
                  </>
                )}

                {/* BODEGUERO */}
                {role === 'BODEGUERO' && (
                  <>
                    <NavItem to="/bodega" icon={<Warehouse />} label="Bodega" />
                  </>
                )}

                {/* OPERARIO */}
                {role === 'OPERARIO' && (
                  <>
                    <NavItem to="/planta" icon={<Factory />} label="Mi Trabajo" />
                  </>
                )}

                {/* TODOS LOS DEMÁS TAMBIÉN TIENEN ACCESO A PERSONAL */}
                {['ADMIN', 'SUPERVISOR', 'BODEGUERO', 'DESPACHADOR'].includes(role) && (
                  <NavItem to="/personal" icon={<UserCircle />} label="Personal" />
                )}

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-4">
                  <button onClick={logout} className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-red-500 active:scale-90 transition-all">
                    <div className="p-1">
                      <LogOut size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Salir</span>
                  </button>
                </div>
              </nav>
            </>
          )}
        </div>
      </Router>
    </ErrorBoundary >
  );
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
      <div className={`flex flex-col items-center gap-1.5 transition-all group ${isActive ? 'text-blue-600' : 'text-[var(--text-muted)] hover:text-blue-500'}`}>
        <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 scale-110 shadow-sm' : 'group-hover:scale-110'}`}>
          {React.cloneElement(icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-40 italic'}`}>{label}</span>
      </div>
    )}
  </NavLink>
);

export default App;
