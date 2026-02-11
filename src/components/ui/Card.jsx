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

export const Card = ({ children, className = '', hover = false }) => {
    return (
        <div className={`
            bg-[var(--bg-card)] 
            rounded-[2.5rem] 
            border border-[var(--border-ui)] 
            shadow-sm 
            overflow-hidden
            ${hover ? 'hover:border-blue-500 hover:shadow-xl transition-all duration-300' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b border-[var(--border-ui)] ${className}`}>
        {children}
    </div>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);
