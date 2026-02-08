'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerWebOrder } from '@/lib/checkout'

interface CheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    productData: {
        id: string
        name: string
        quantity: number
        price: number
        options: string
    }
}

export default function CheckoutModal({ isOpen, onClose, productData }: CheckoutModalProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [step, setStep] = useState(1) // 1: Datos, 2: Pago
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        ciudad: ''
    })
    const [paymentMethod, setPaymentMethod] = useState<'direct' | 'wompi' | 'addi' | 'sistecredito'>('direct')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (step === 1) {
            setStep(2)
            return
        }

        setLoading(true)

        try {
            // Generar un número de orden aleatorio
            const ordenCompra = `WEB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

            await registerWebOrder({
                orden_compra: ordenCompra,
                cliente: formData.nombre.toUpperCase(),
                email: formData.email,
                telefono: formData.telefono,
                producto: `${productData.name} - ${productData.options} [PAGO: ${paymentMethod.toUpperCase()}]`.toUpperCase(),
                cantidad: productData.quantity
            })

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
                setStep(1)
                setFormData({ nombre: '', email: '', telefono: '', ciudad: '' })
            }, 3000)
        } catch (error) {
            alert('Error al procesar el pedido. Por favor intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10"
                    >
                        {success ? (
                            <div className="text-center py-12 flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">¡Pedido Recibido!</h2>
                                    <p className="text-stone-500">Nos pondremos en contacto contigo pronto para coordinar el envío y el pago.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {step === 1 ? (
                                    <>
                                        <div className="mb-8">
                                            <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">Completar Compra</h2>
                                            <p className="text-stone-500 text-sm">Ingresa tus datos para procesar el pedido.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Nombre Completo</label>
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full h-14 bg-stone-50 border border-stone-100 rounded-2xl px-6 text-stone-900 outline-none focus:border-amber-800 transition-all font-medium"
                                                    placeholder="Ej: Juan Pérez"
                                                    value={formData.nombre}
                                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        className="w-full h-14 bg-stone-50 border border-stone-100 rounded-2xl px-6 text-stone-900 outline-none focus:border-amber-800 transition-all font-medium"
                                                        placeholder="juan@correo.com"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">WhatsApp / Teléfono</label>
                                                    <input
                                                        required
                                                        type="tel"
                                                        className="w-full h-14 bg-stone-50 border border-stone-100 rounded-2xl px-6 text-stone-900 outline-none focus:border-amber-800 transition-all font-medium"
                                                        placeholder="300 123 4567"
                                                        value={formData.telefono}
                                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Ciudad / Departamento</label>
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full h-14 bg-stone-50 border border-stone-100 rounded-2xl px-6 text-stone-900 outline-none focus:border-amber-800 transition-all font-medium"
                                                    placeholder="Ej: Medellín, Antioquia"
                                                    value={formData.ciudad}
                                                    onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full h-16 bg-stone-900 text-stone-50 font-bold rounded-full hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 uppercase tracking-widest text-xs"
                                            >
                                                Continuar al Pago
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-8">
                                            <button onClick={() => setStep(1)} className="text-stone-400 text-xs flex items-center gap-1 mb-2 hover:text-amber-800 transition-colors">
                                                ← Volver a mis datos
                                            </button>
                                            <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">Método de Pago</h2>
                                            <p className="text-stone-500 text-sm">Escoge cómo deseas pagar tu pedido.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {/* Wompi Card */}
                                                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'wompi' ? 'border-amber-800 bg-amber-50' : 'border-stone-100 hover:border-stone-200'}`}>
                                                    <input type="radio" name="payment" className="hidden" onChange={() => setPaymentMethod('wompi')} />
                                                    <div className="w-10 h-10 bg-white rounded-full border border-stone-100 flex items-center justify-center shadow-sm">
                                                        <svg className="w-6 h-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-900">Tarjeta Crédito / PSE</p>
                                                        <p className="text-[10px] text-stone-500 uppercase font-medium">Procesado por Wompi</p>
                                                    </div>
                                                </label>

                                                {/* Addi */}
                                                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'addi' ? 'border-[#00C896] bg-[#00C896]/10' : 'border-stone-100 hover:border-stone-200'}`}>
                                                    <input type="radio" name="payment" className="hidden" onChange={() => setPaymentMethod('addi')} />
                                                    <div className="w-10 h-10 bg-[#00C896] rounded-full flex items-center justify-center shadow-sm">
                                                        <span className="text-white font-black text-xs">addi</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-900">Paga en Cuotas con Addi</p>
                                                        <p className="text-[10px] text-stone-500 uppercase font-medium">Aprobación en segundos</p>
                                                    </div>
                                                </label>

                                                {/* Sistecredito */}
                                                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'sistecredito' ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-200'}`}>
                                                    <input type="radio" name="payment" className="hidden" onChange={() => setPaymentMethod('sistecredito')} />
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                                        <span className="text-white font-black text-[8px] uppercase">Siste</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-900">Sistecredito</p>
                                                        <p className="text-[10px] text-stone-500 uppercase font-medium">Crédito inmediato</p>
                                                    </div>
                                                </label>

                                                {/* Direct / Bank Transfer */}
                                                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'direct' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-200'}`}>
                                                    <input type="radio" name="payment" className="hidden" onChange={() => setPaymentMethod('direct')} />
                                                    <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center shadow-sm text-stone-600">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-900">Transferencia Bancaria</p>
                                                        <p className="text-[10px] text-stone-500 uppercase font-medium">Bancolombia / Nequi</p>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="bg-stone-50 rounded-3xl p-6 mb-4 border border-stone-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-stone-500 uppercase font-bold tracking-tight">Total a Pagar</span>
                                                    <span className="text-stone-900 font-bold text-xl">${(productData.price * productData.quantity).toLocaleString()} COP</span>
                                                </div>
                                            </div>

                                            <button
                                                disabled={loading}
                                                type="submit"
                                                className="w-full h-16 bg-stone-900 text-stone-50 font-bold rounded-full hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 uppercase tracking-widest text-xs disabled:opacity-50"
                                            >
                                                {loading ? 'Procesando...' : 'Finalizar y Pagar'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
