/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import React from 'react';
import { Search } from 'lucide-react';

export const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon: Icon,
    required = false,
    className = '',
    search = false
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">{label}</label>}
            <div className="relative group">
                {(Icon || search) && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors">
                        {search ? <Search size={16} /> : <Icon size={16} />}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={`
                        w-full 
                        ${(Icon || search) ? 'pl-12' : 'pl-4'} 
                        pr-4 
                        py-3 
                        bg-[var(--bg-input)] 
                        border border-[var(--border-ui)] 
                        rounded-2xl 
                        font-bold 
                        text-xs 
                        text-[var(--text-main)] 
                        outline-none 
                        focus:border-blue-500 
                        transition-all 
                        placeholder:opacity-40
                        dark:text-white
                    `}
                />
            </div>
        </div>
    );
};
