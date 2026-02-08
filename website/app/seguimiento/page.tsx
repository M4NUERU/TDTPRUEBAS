'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'

type OrderStatus = 'PENDIENTE' | 'EN PLANTA' | 'TERMINADO' | 'ENVIADO'

interface OrderData {
    id: string
    status: OrderStatus
    product: string
    date: string
}

export default function TrackingPage() {
    const [orderId, setOrderId] = useState('')
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<OrderData | null>(null)
    const [error, setError] = useState('')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId.trim()) return

        setLoading(true)
        setError('')
        setOrder(null)

        try {
            const res = await fetch(`/api/orders/track?id=${orderId}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al buscar pedido')
            }

            setOrder(data.data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getProgress = (status: OrderStatus) => {
        switch (status) {
            case 'PENDIENTE': return 10
            case 'EN PLANTA': return 40
            case 'TERMINADO': return 75
            case 'ENVIADO': return 100
            default: return 0
        }
    }

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case 'PENDIENTE': return 'Pedido Recibido'
            case 'EN PLANTA': return 'En Producción'
            case 'TERMINADO': return 'Empacando / Listo'
            case 'ENVIADO': return 'En Camino'
            default: return status
        }
    }

    return (
        <main className="min-h-screen bg-stone-50">
            <Header />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-amber-800 text-[10px] font-bold uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full">
                        Rastreo de Pedidos
                    </span>
                    <h1 className="font-display text-3xl sm:text-5xl font-black text-stone-900 mt-6 mb-4">
                        Sigue tu Compra
                    </h1>
                    <p className="text-stone-500 max-w-md mx-auto">
                        Ingresa tu número de orden (ej. WEB-XJ92) para ver el estado actual de tu mueble.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 p-8">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Número de Orden..."
                            className="flex-1 px-6 py-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 font-medium uppercase"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-stone-900 text-stone-50 font-medium rounded-xl hover:bg-amber-900 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Buscando...' : 'Rastrear'}
                        </button>
                    </form>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        {order && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-center pb-8 border-b border-stone-100">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Tu Producto</p>
                                        <h3 className="text-xl font-bold text-stone-900">{order.product}</h3>
                                    </div>
                                    <div className="mt-4 sm:mt-0 text-right">
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Fecha Estimada</p>
                                        <p className="text-amber-800 font-medium">10 - 15 Hábiles</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
                                        <span>Recibido</span>
                                        <span>En Planta</span>
                                        <span>Listo</span>
                                        <span>Enviado</span>
                                    </div>
                                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getProgress(order.status)}%` }}
                                            transition={{ duration: 1, ease: 'circOut' }}
                                            className="h-full bg-gradient-to-r from-stone-900 to-amber-800 rounded-full"
                                        />
                                    </div>
                                    <div className="text-center pt-2">
                                        <span className="inline-block px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-full">
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <a
                                        href={`/api/orders/${order.id}/invoice`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium text-stone-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Descargar Factura
                                    </a>
                                </div>

                                {order.status === 'ENVIADO' && (
                                    <div className="p-6 bg-amber-50 rounded-2xl flex items-start gap-4">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-900 mb-1">¡Ya va en camino!</h4>
                                            <p className="text-amber-800/80 text-sm">
                                                Tu pedido ha sido entregado a la transportadora. Recibirás un mensaje de WhatsApp con tu número de guía en breve.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </main>
    )
}
