'use client'

import { useStore, Brand } from '@/lib/store'
import { motion } from 'framer-motion'

const BRANDS = [
    {
        id: 'TODOTEJIDOS' as Brand,
        label: 'TODOTEJIDOS',
        color: 'bg-[#0F172A]', // Brand Navy
        accent: 'border-brand-gold'
    },
    {
        id: 'EMADERA' as Brand,
        label: 'E-MADERA',
        color: 'bg-[#451a03]', // Wood Brown
        accent: 'border-orange-500'
    }
]

export default function BrandSwitcher() {
    const { activeBrand, setActiveBrand } = useStore()

    return (
        <div className="w-full bg-white border-b border-stone-100 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10">
                <div className="flex h-full border-x border-stone-100">
                    {BRANDS.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => setActiveBrand(brand.id)}
                            className={`relative px-8 h-full flex items-center gap-2 transition-all group ${activeBrand === brand.id
                                    ? 'bg-stone-50'
                                    : 'hover:bg-stone-50/50'
                                }`}
                        >
                            <span
                                className={`text-[10px] font-black tracking-widest transition-colors ${activeBrand === brand.id
                                        ? 'text-stone-900'
                                        : 'text-stone-400 group-hover:text-stone-600'
                                    }`}
                            >
                                {brand.label}
                            </span>

                            {/* Active Indicator */}
                            {activeBrand === brand.id && (
                                <motion.div
                                    layoutId="brand-indicator"
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${brand.id === 'TODOTEJIDOS' ? 'bg-[#c29d6d]' : 'bg-orange-800'
                                        }`}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Secondary Links or Tagline */}
                <div className="ml-auto hidden lg:flex items-center gap-6">
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
                        Calidad Artesanal Garantizada
                    </span>
                </div>
            </div>
        </div>
    )
}
