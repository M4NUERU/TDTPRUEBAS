'use client'

import { Fabric } from '@/lib/types'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface FabricSelectorProps {
    fabrics: Fabric[]
    selectedFabricId: string
    onSelect: (id: string) => void
}

export default function FabricSelector({ fabrics, selectedFabricId, onSelect }: FabricSelectorProps) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">Selecciona tu Tela</h3>
                <p className="text-sm text-stone-500">
                    Elige el material que mejor se adapte a tu estilo de vida.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {fabrics.map((fabric) => {
                    const isSelected = fabric.id === selectedFabricId

                    return (
                        <motion.button
                            key={fabric.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(fabric.id)}
                            className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-luxury ${isSelected
                                ? 'border-amber-800 bg-amber-50/50'
                                : 'border-stone-100 hover:border-stone-200 bg-transparent'
                                }`}
                        >
                            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border border-stone-200">
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: fabric.colorHex }}
                                />
                                {fabric.textureUrl && (
                                    <div
                                        className="absolute inset-0 size-full opacity-40 mix-blend-multiply"
                                        style={{
                                            backgroundImage: `url(${fabric.textureUrl})`,
                                            backgroundSize: 'cover'
                                        }}
                                    />
                                )}
                            </div>

                            <span className={`text-xs font-bold text-center tracking-wide uppercase ${isSelected ? 'text-amber-800' : 'text-stone-700'
                                }`}>
                                {fabric.name}
                            </span>

                            {fabric.additionalPrice > 0 && (
                                <span className="text-[10px] text-stone-400 mt-1">
                                    +${fabric.additionalPrice.toLocaleString()}
                                </span>
                            )}

                            {isSelected && (
                                <motion.div
                                    layoutId="selected-indicator"
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-amber-800 text-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            <div className="p-4 bg-stone-100 rounded-2xl">
                <AnimatePresence mode="wait">
                    {fabrics.map((fabric) => (
                        fabric.id === selectedFabricId && (
                            <motion.div
                                key={fabric.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-1"
                            >
                                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
                                    Propiedades de {fabric.name}
                                </span>
                                <p className="text-sm text-stone-600 leading-relaxed italic">
                                    &quot;{fabric.description}&quot;
                                </p>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

import { AnimatePresence } from 'framer-motion'
