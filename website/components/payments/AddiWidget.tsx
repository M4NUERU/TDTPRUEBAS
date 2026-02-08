'use client'

import { motion } from 'framer-motion'
import { formatCOP } from '@/lib/utils'

interface AddiWidgetProps {
    totalAmount: number
    installments?: number
}

export default function AddiWidget({ totalAmount, installments = 3 }: AddiWidgetProps) {
    const monthlyPayment = Math.ceil(totalAmount / installments)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00D9A5] via-[#00C896] to-[#00B087] p-6 text-white"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="addiPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="2" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#addiPattern)" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* Addi Logo */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center">
                        <span className="text-[#00C896] font-bold text-lg">addi</span>
                    </div>
                    <span className="text-sm font-medium opacity-90">Compra ahora, paga después</span>
                </div>

                {/* Payment Info */}
                <div className="space-y-3">
                    <div className="text-3xl font-bold">
                        {formatCOP(monthlyPayment)}
                        <span className="text-lg font-normal opacity-80">/mes</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Sin intereses • {installments} cuotas fijas</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm opacity-90">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Aprobación en segundos</span>
                    </div>
                </div>

                {/* Installment Breakdown */}
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between text-sm">
                        <span className="opacity-80">Total a pagar:</span>
                        <span className="font-semibold">{formatCOP(totalAmount)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                        {Array.from({ length: installments }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: i * 0.2, duration: 0.5 }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs mt-2 opacity-70 text-center">
                        Cuota {1} de {installments} • Próximo pago en 30 días
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
