'use client'

import { PriceBreakdown } from '@/lib/types'
import { motion } from 'framer-motion'

interface PriceDisplayProps {
    priceBreakdown: PriceBreakdown
    totalPrice: number
    addiInstallment: number
}

export default function PriceDisplay({ priceBreakdown, totalPrice, addiInstallment }: PriceDisplayProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-stone-500">
                    <span>Precio Base</span>
                    <span>${priceBreakdown.basePrice.toLocaleString()}</span>
                </div>

                {priceBreakdown.fabricAdditional > 0 && (
                    <div className="flex justify-between items-center text-sm text-stone-500">
                        <span>Adicional Textil</span>
                        <span className="text-amber-800">+${priceBreakdown.fabricAdditional.toLocaleString()}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                    <span className="text-lg font-bold text-stone-900">Total</span>
                    <motion.span
                        key={totalPrice}
                        initial={{ scale: 1.1, color: '#92400e' }}
                        animate={{ scale: 1, color: '#1c1917' }}
                        className="text-2xl font-display font-bold text-stone-900"
                    >
                        ${totalPrice.toLocaleString()} COP
                    </motion.span>
                </div>
            </div>

            {/* Addi Installment Card */}
            <div className="glass p-5 rounded-2xl border border-amber-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#00D0B5] flex items-center justify-center font-bold text-white text-[10px]">
                            ADDI
                        </div>
                        <span className="text-xs font-bold text-stone-800 tracking-tighter uppercase">Simulador Addi</span>
                    </div>
                    <span className="text-xs text-stone-400">3 cuotas sin interés</span>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-semibold text-stone-900">${addiInstallment.toLocaleString()}</span>
                    <span className="text-sm font-medium text-stone-500">/ mes</span>
                </div>

                <p className="text-[10px] text-stone-400">
                    *Sujeto a aprobación de crédito por parte de Addi. Cuotas estimadas.
                </p>
            </div>
        </div>
    )
}
