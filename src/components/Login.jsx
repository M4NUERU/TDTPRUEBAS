import React, { useState, useEffect } from 'react';
import { loginWithPIN } from '../api/userService';
import { toast } from 'sonner';
import { Package, X, Delete, ChevronRight, Lock, UserCircle, Settings } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const [matchingUsers, setMatchingUsers] = useState([]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (pin.length < 4) {
            toast.error('PIN DEMASIADO CORTO');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await loginWithPIN(pin);

            if (error || !data || data.length === 0) {
                toast.error('PIN INCORRECTO', {
                    description: 'Verifica tu código e intenta de nuevo.'
                });
                setPin('');
            } else if (data.length === 1) {
                toast.success(`BIENVENIDO, ${data[0].nombre}`);
                // SEGURIDAD: Eliminamos el PIN del objeto antes de guardarlo en sesión
                const { pin: userPin, ...userWithoutPin } = data[0];
                onLoginSuccess(userWithoutPin);
            } else {
                // Multiple matching PINs (common during initial setup)
                // SEGURIDAD: Limpiamos los PINs incluso en la selección múltiple
                const safeUsers = data.map(({ pin: p, ...u }) => u);
                setMatchingUsers(safeUsers);
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('ERROR DE CONEXIÓN');
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit when pin reaches 4 digits & Keyboard support
    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }

        const handleKeyDown = (e) => {
            // Ignore if matching users view is active
            if (matchingUsers.length > 0) return;

            if (e.key >= '0' && e.key <= '9') {
                handleNumberClick(e.key);
            } else if (e.key === 'Backspace') {
                handleDelete();
            } else if (e.key === 'Enter') {
                if (pin.length === 4) handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, matchingUsers]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
            {/* Logo */}
            <div className="w-24 h-24 bg-[var(--brand)] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-[var(--brand)]/20 animate-in zoom-in-50 duration-500">
                <Package size={48} className="text-[var(--bg-card)] drop-shadow-xl" />
            </div>

            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter italic">Todo<span className="text-[var(--brand)]">Tejidos</span></h1>
                <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.4em] opacity-50">Smart Factory Management</p>
            </div>

            <div className="w-full max-w-xs space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                {/* Input Area */}
                {/* Identification Step (if shared PIN) */}
                {matchingUsers.length > 0 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-black uppercase text-[var(--brand)] tracking-widest mb-1">Múltiples perfiles con este PIN</p>
                            <h2 className="text-lg font-black text-[var(--text-main)] uppercase">¿Quién eres?</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pb-4 pr-1">
                            {matchingUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        toast.success(`BIENVENIDO, ${user.nombre}`);
                                        // El user ya viene sin PIN desde el handleSubmit
                                        onLoginSuccess(user);
                                    }}
                                    className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-2xl flex flex-col items-center hover:border-[var(--brand)] hover:bg-[var(--brand)]/10 transition-all"
                                >
                                    <span className="font-black text-xs uppercase text-[var(--text-main)]">{user.nombre}</span>
                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase mt-0.5 opacity-60 tracking-widest">{user.rol || 'OPERARIO'}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => { setMatchingUsers([]); setPin(''); }}
                            className="w-full py-4 text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-red-500 transition-all"
                        >
                            ← Volver al teclado
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="relative group">
                            <div className="flex justify-center gap-3 mb-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${i < pin.length
                                            ? 'bg-[var(--brand)] border-[var(--brand)] scale-125 shadow-lg shadow-[var(--brand)]/40'
                                            : 'border-[var(--border-ui)] scale-100 opacity-30 shadow-inner'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num.toString())}
                                    className="h-16 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-2xl text-xl font-black hover:bg-[var(--brand)] hover:text-[var(--bg-card)] hover:border-[var(--brand)] transition-all active:scale-90"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={handleDelete}
                                className="h-16 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all active:scale-90"
                            >
                                <Delete size={24} />
                            </button>
                            <button
                                onClick={() => handleNumberClick('0')}
                                className="h-16 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-ui)] rounded-2xl text-xl font-black hover:bg-[var(--brand)] hover:text-[var(--bg-card)] hover:border-[var(--brand)] transition-all active:scale-90"
                            >
                                0
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || pin.length < 4}
                                className="h-16 flex items-center justify-center bg-[var(--brand)] text-[var(--bg-card)] rounded-2xl shadow-xl shadow-[var(--brand)]/20 hover:bg-[var(--brand-hover)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>
                    </>
                )}

                <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest flex items-center justify-center gap-2">
                        <Lock size={10} /> Acceso Restringido
                    </p>
                </div>
            </div>

            <p className="mt-16 text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.4em] opacity-20">Device Authorized • Secure Session</p>
        </div>
    );
};

export default Login;
