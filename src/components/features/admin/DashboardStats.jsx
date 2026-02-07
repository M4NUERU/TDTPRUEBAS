import React from 'react';
import { Card } from '../../ui/Card';

export const DashboardStats = ({ stats, loading }) => {
    if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl" />;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-main)] mb-1">{stat.value}</h3>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                </Card>
            ))}
        </div>
    );
};
