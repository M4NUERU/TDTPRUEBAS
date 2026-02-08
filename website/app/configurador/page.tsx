'use client'

import { Suspense, useState } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import FabricSelector from '@/components/ui/FabricSelector'
import PriceDisplay from '@/components/ui/PriceDisplay'
import dynamic from 'next/dynamic'
import { fabrics } from '@/lib/data'
import { useProductConfigurator } from '@/hooks/useProductConfigurator'
import { motion, AnimatePresence } from 'framer-motion'

const ProductViewer = dynamic(() => import('@/components/3d/ProductViewer'), {
    ssr: false,
})

const ARViewer = dynamic(() => import('@/components/ar/ARViewer'), {
    ssr: false,
})

export default function ConfiguratorPage() {
    const [showAR, setShowAR] = useState(false)
    const {
        product,
        selectedFabric,
        setSelectedFabric,
        availableFabrics,
        priceBreakdown,
        totalPrice,
        addiInstallment,
        quantity,
        setQuantity
    } = useProductConfigurator({ initialProductId: 'sofacama-valencia' })

    if (!product) return null

    return (
        <main className="min-h-screen bg-stone-50">
            <Header />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: 3D Viewer */}
                    <div className="lg:col-span-7 xl:col-span-8 sticky top-24 h-[50vh] lg:h-[70vh]">
                        <div className="relative w-full h-full glass rounded-3xl overflow-hidden shadow-2xl shadow-stone-200">
                            {showAR ? (
                                <ARViewer
                                    modelUrl={product.modelUrl || ''}
                                    usdzUrl={product.usdzUrl}
                                    alt={product.name}
                                />
                            ) : (
                                <ProductViewer
                                    modelUrl={product.modelUrl}
                                    textureUrl={selectedFabric.textureUrl}
                                    color={selectedFabric.colorHex}
                                />
                            )}

                            {/* AR Toggle */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                                <button
                                    onClick={() => setShowAR(false)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-luxury ${!showAR ? 'bg-stone-900 text-white' : 'bg-white/20 backdrop-blur-md text-stone-900'
                                        }`}
                                >
                                    Vista 3D
                                </button>
                                <button
                                    onClick={() => setShowAR(true)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-luxury ${showAR ? 'bg-stone-900 text-white' : 'bg-white/20 backdrop-blur-md text-stone-900'
                                        }`}
                                >
                                    Ver en AR
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Configuration UI */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
                        <div>
                            <span className="text-amber-800 text-sm font-bold tracking-luxury mb-2 block">
                                Configuración Personalizada
                            </span>
                            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-stone-900 mb-4">
                                {product.name}
                            </h1>
                            <p className="text-stone-600 leading-relaxed">
                                Personaliza tu mueble seleccionando entre nuestra exclusiva gama de telas colombianas de alta calidad.
                            </p>
                        </div>

                        <hr className="border-stone-200" />

                        {/* Fabric Selector Component */}
                        <FabricSelector
                            fabrics={availableFabrics}
                            selectedFabricId={selectedFabric.id}
                            onSelect={setSelectedFabric}
                        />

                        <hr className="border-stone-200" />

                        {/* Price Details */}
                        <PriceDisplay
                            priceBreakdown={priceBreakdown}
                            totalPrice={totalPrice}
                            addiInstallment={addiInstallment}
                        />

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-stone-200 rounded-full px-2 py-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-semibold text-stone-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                <button className="flex-1 py-4 bg-stone-900 text-stone-50 font-bold rounded-full hover:bg-stone-800 transition-luxury shadow-xl shadow-stone-900/10">
                                    Añadir al Carrito
                                </button>
                            </div>

                            <button className="flex items-center justify-center gap-2 py-4 border-2 border-stone-900 text-stone-900 font-bold rounded-full hover:bg-stone-900 hover:text-stone-50 transition-luxury">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Comprar Ahora
                            </button>
                        </div>

                        {/* WhatsApp Pulse Button */}
                        <div className="whatsapp-btn flex items-center justify-center py-4 bg-[#25D366] text-white font-bold rounded-full cursor-pointer shadow-lg shadow-green-500/20 mt-2">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Chatear con un Experto
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
