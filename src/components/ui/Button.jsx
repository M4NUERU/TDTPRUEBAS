import React from 'react';
import { RefreshCw } from 'lucide-react';

export const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    type = 'button',
    icon: Icon
}) => {

    const baseStyles = "font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 rounded-2xl disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700",
        secondary: "bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-[var(--border-ui)] hover:text-[var(--text-main)]",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
        ghost: "bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-input)]",
        success: "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-[9px]",
        md: "px-6 py-3 text-[10px]",
        lg: "px-8 py-4 text-xs",
        icon: "p-2"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading ? <RefreshCw className="animate-spin" size={size === 'sm' ? 12 : 16} /> : Icon && <Icon size={size === 'sm' ? 14 : 18} />}
            {children}
        </button>
    );
};
