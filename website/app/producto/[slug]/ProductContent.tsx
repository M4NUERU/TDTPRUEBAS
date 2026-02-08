'use client'

import { useState } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { useProductConfigurator } from '@/hooks/useProductConfigurator'
import dynamic from 'next/dynamic'
import FabricSelector from '@/components/ui/FabricSelector'
import PriceDisplay from '@/components/ui/PriceDisplay'
import { motion } from 'framer-motion'
import CheckoutModal from '@/components/ui/CheckoutModal'
import { Product } from '@/lib/types'

const ProductViewer = dynamic(() => import('@/components/3d/ProductViewer'), {
    ssr: false,
})

const ARViewer = dynamic(() => import('@/components/ar/ARViewer'), {
    ssr: false,
})

interface ProductContentProps {
    product: Product
}

export default function ProductContent({ product }: ProductContentProps) {
    const [showAR, setShowAR] = useState(false)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const {
        selectedFabric,
        setSelectedFabric,
        selectedVariant,
        setSelectedVariant,
        availableFabrics,
        priceBreakdown,
        totalPrice,
        addiInstallment,
        quantity,
        setQuantity
    } = useProductConfigurator({ initialProductId: product.id })

    return (
        <main className="min-h-screen bg-stone-50">
            <Header />

            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Visual Section */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="sticky top-24 space-y-8">
                            {/* 3D Viewer */}
                            <div className="relative aspect-square lg:aspect-video glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-200">
                                {showAR ? (
                                    <ARViewer
                                        modelUrl={selectedVariant?.modelUrl || product.modelUrl || ''}
                                        usdzUrl={product.usdzUrl}
                                        alt={product.name}
                                    />
                                ) : (
                                    <ProductViewer
                                        modelUrl={selectedVariant?.modelUrl || product.modelUrl}
                                        textureUrl={selectedFabric.textureUrl}
                                        color={selectedVariant?.colorHex || selectedFabric.colorHex}
                                        autoRotate={true}
                                    />
                                )}

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

                            {/* Features Bento */}
                            <div className="grid grid-cols-2 gap-4">
                                {product.features.map((feature, i) => (
                                    <div key={i} className="p-6 bg-white rounded-3xl border border-stone-100 flex flex-col gap-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-stone-700">{feature}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                    {product.category}
                                </span>
                                <span className="text-stone-400 text-xs text-nowrap">SKU: {selectedVariant?.sku || product.id}</span>
                            </div>
                            <h1 className="font-display text-5xl font-semibold text-stone-900 mb-6">
                                {product.name}
                            </h1>
                            <p className="text-lg text-stone-600 leading-relaxed font-light">
                                {product.description}
                            </p>
                        </div>

                        {product.variants && product.variants.length > 1 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Seleccionar Color</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.sku}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`group relative w-12 h-12 rounded-full border-2 transition-luxury ${selectedVariant?.sku === variant.sku ? 'border-amber-600 scale-110' : 'border-transparent hover:border-stone-200'
                                                }`}
                                            title={variant.color}
                                        >
                                            <div
                                                className="absolute inset-1 rounded-full shadow-inner"
                                                style={{ backgroundColor: variant.colorHex }}
                                            />
                                            {selectedVariant?.sku === variant.sku && (
                                                <motion.div
                                                    layoutId="variant-outline"
                                                    className="absolute inset-[-4px] rounded-full border border-amber-600/30"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-stone-500 italic">Color: {selectedVariant?.color}</p>
                            </div>
                        )}

                        <hr className="border-stone-200" />

                        <FabricSelector
                            fabrics={availableFabrics}
                            selectedFabricId={selectedFabric.id}
                            onSelect={setSelectedFabric}
                        />

                        <hr className="border-stone-200" />

                        <PriceDisplay
                            priceBreakdown={priceBreakdown}
                            totalPrice={totalPrice}
                            addiInstallment={addiInstallment}
                        />

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="flex items-center border-2 border-stone-200 rounded-full h-14 px-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-bold text-stone-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="flex-1 h-14 bg-stone-900 text-stone-50 font-bold rounded-full hover:bg-stone-800 transition-luxury shadow-xl shadow-stone-900/10 uppercase tracking-widest text-xs"
                                >
                                    Comprar Ahora
                                </button>
                            </div>

                            <button className="h-14 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#128C7E] transition-luxury flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 uppercase tracking-widest text-xs whatsapp-btn">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Consultar Disponibilidad
                            </button>
                        </div>

                        <div className="p-8 bg-stone-100 rounded-[2rem] flex flex-col gap-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Dimensiones Sugeridas</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(product.dimensions).map(([key, val]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-[10px] text-stone-400 uppercase">{key}</span>
                                        <span className="text-xl font-display text-stone-900">{val}cm</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                productData={{
                    id: product.id,
                    name: product.name,
                    price: totalPrice,
                    quantity: quantity,
                    options: `${selectedVariant?.color || ''} - ${selectedFabric.name}`
                }}
            />
        </main>
    )
}
