'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCOP, generatePaymentReference } from '@/lib/utils'
import { WompiTransaction } from '@/lib/types'

interface WompiCheckoutProps {
    amount: number
    productName: string
    customerEmail?: string
    onPaymentStart?: () => void
}

export default function WompiCheckout({
    amount,
    productName,
    customerEmail = '',
    onPaymentStart,
}: WompiCheckoutProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'pse' | null>(null)

    const handlePayment = async (method: 'card' | 'pse') => {
        setSelectedMethod(method)
        setIsLoading(true)
        onPaymentStart?.()

        // In production, this would create a Wompi transaction
        const transaction: WompiTransaction = {
            amount,
            currency: 'COP',
            reference: generatePaymentReference(),
            customerEmail,
            customerFullName: '',
            redirectUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/pago/confirmacion`,
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // In production, redirect to Wompi checkout
        console.log('Wompi transaction:', transaction)
        setIsLoading(false)
        setSelectedMethod(null)
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-stone-900">Métodos de Pago</h3>

            {/* Payment Methods */}
            <div className="grid grid-cols-2 gap-3">
                {/* Credit/Debit Card */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayment('card')}
                    disabled={isLoading}
                    className="relative p-4 bg-white border-2 border-stone-200 rounded-xl hover:border-stone-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && selectedMethod === 'card' && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                            {/* Visa */}
                            <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
                                <rect width="48" height="32" rx="4" fill="#1A1F71" />
                                <path d="M19.5 21H17L18.5 11H21L19.5 21ZM15 11L12.5 18L12 15.5L11 12C11 12 10.9 11 9.5 11H6L6 11.2C6 11.2 7.6 11.5 9.5 12.8L12 21H14.5L18 11H15ZM35 21H37.5L35.5 11H33.5C32.5 11 32 11.5 32 12L28 21H30.5L31 19.5H34L34.5 21H35ZM31.5 17.5L33 13L33.5 17.5H31.5ZM27 14L27.5 11.5C27.5 11.5 26 11 24.5 11C22.5 11 19 12 19 15.5C19 18.5 23.5 18.5 23.5 20C23.5 21.5 19.5 21 18 20L17.5 22.5C17.5 22.5 19 23 21 23C23 23 27 21.5 27 18C27 14.5 22.5 15 22.5 13C22.5 11 26 11.5 27 14Z" fill="white" />
                            </svg>
                            {/* Mastercard */}
                            <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
                                <rect width="48" height="32" rx="4" fill="#000" />
                                <circle cx="18" cy="16" r="8" fill="#EB001B" />
                                <circle cx="30" cy="16" r="8" fill="#F79E1B" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M24 22.3C26 20.5 27.2 18.4 27.2 16C27.2 13.6 26 11.5 24 9.7C22 11.5 20.8 13.6 20.8 16C20.8 18.4 22 20.5 24 22.3Z" fill="#FF5F00" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-stone-700">Tarjeta</span>
                    </div>
                </motion.button>

                {/* PSE */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePayment('pse')}
                    disabled={isLoading}
                    className="relative p-4 bg-white border-2 border-stone-200 rounded-xl hover:border-stone-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && selectedMethod === 'pse' && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-6 bg-[#0033A0] rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PSE</span>
                        </div>
                        <span className="text-sm font-medium text-stone-700">Débito Bancario</span>
                    </div>
                </motion.button>
            </div>

            {/* Wompi Badge */}
            <div className="flex items-center justify-center gap-2 pt-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs text-stone-500">
                    Pago seguro procesado por <span className="font-medium text-stone-700">Wompi</span>
                </span>
            </div>

            {/* Amount Display */}
            <div className="p-3 bg-stone-100 rounded-lg text-center">
                <span className="text-sm text-stone-600">Total a pagar: </span>
                <span className="font-semibold text-stone-900">{formatCOP(amount)}</span>
            </div>
        </div>
    )
}
