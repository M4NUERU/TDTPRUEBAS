'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useStore();

    // Hydration fix for Persist middleware
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => { setHydrated(true) }, []);

    if (!hydrated) return null;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-stone-100"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-brand-gold w-6 h-6" />
                                <h2 className="text-xl font-display font-bold text-brand-navy">Tu Bolsa</h2>
                                <span className="bg-brand-navy text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {cart.length} items
                                </span>
                            </div>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <ShoppingBag size={64} className="mb-4 text-stone-300" />
                                    <p className="font-display text-lg font-medium text-brand-navy">Tu bolsa está vacía</p>
                                    <p className="text-sm text-stone-500">¡Explora nuestra colección de telas!</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        layout
                                        key={`${item.id}-${item.color}`}
                                        className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100"
                                    >
                                        {/* Image Placeholder or Actual Image */}
                                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-stone-200">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-stone-200 flex items-center justify-center text-xs text-stone-400">No img</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-brand-navy line-clamp-1">{item.name}</h3>
                                                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{item.color}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.color, -1)}
                                                        className="p-1 hover:text-brand-gold transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.color, 1)}
                                                        className="p-1 hover:text-brand-gold transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.color)}
                                                    className="text-stone-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-stone-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-stone-500">
                                        <span>Subtotal</span>
                                        <span>$ {cartTotal().toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-brand-navy">
                                        <span>Total</span>
                                        <span>$ {cartTotal().toLocaleString('es-CO')}</span>
                                    </div>
                                    <p className="text-[10px] text-stone-400 text-center">
                                        Impuestos y envío calculados al finalizar
                                    </p>
                                </div>

                                <button className="w-full py-4 bg-brand-navy text-white rounded-xl font-bold uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20 flex items-center justify-center gap-2">
                                    Iniciar Compra <ShoppingBag size={18} />
                                </button>
                                <button className="w-full py-3 bg-brand-gold/10 text-brand-gold rounded-xl font-bold uppercase tracking-widest hover:bg-brand-gold/20 transition-all text-xs">
                                    Seguir Explorando
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
