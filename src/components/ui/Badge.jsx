/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {

    // Status-based variants
    const variants = {
        default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400", // Terminados / Stock alto
        warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400", // Pendientes / Stock medio
        danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400", // Bajos / Urgentes
        info: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400", // OC / Info
        outline: "border border-[var(--border-ui)] text-[var(--text-muted)] bg-transparent"
    };

    return (
        <span className={`
            px-2 
            py-0.5 
            rounded-lg 
            text-[8px] 
            font-black 
            uppercase 
            tracking-widest 
            ${variants[variant] || variants.default} 
            ${className}
        `}>
            {children}
        </span>
    );
};
