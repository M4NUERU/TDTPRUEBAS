'use client'

import { motion } from 'framer-motion'
import { products } from '@/lib/data'
import { useStore } from '@/lib/store'
import ProductCard from './ProductCard'

export default function BentoGrid() {
    const { activeBrand } = useStore()
    const isTodoTejidos = activeBrand === 'TODOTEJIDOS'

    // Define the layout pattern for the bento grid
    const gridPattern: ('normal' | 'large' | 'tall')[] = ['large', 'tall', 'normal', 'normal']

    const filteredProducts = products.filter(p => p.brand === activeBrand)

    return (
        <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-stone-50">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    key={activeBrand}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className={`text-sm tracking-widest uppercase font-black ${isTodoTejidos ? 'text-brand-navy' : 'text-orange-900'
                        }`}>
                        {isTodoTejidos ? 'Colección Textil 2026' : 'Maestros Ebanistas'}
                    </span>
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-stone-900 mt-4 uppercase">
                        {isTodoTejidos ? 'Nuestra Colección' : 'Galería de Madera'}
                    </h2>
                    <p className="text-stone-600 mt-4 max-w-2xl mx-auto text-lg font-light">
                        {isTodoTejidos
                            ? "Cada pieza es una obra de arte funcional, tejida con pasión y diseñada para transformar tu hogar."
                            : "Mobiliario con alma de madera. Piezas únicas talladas a mano que celebran la belleza natural del árbol."
                        }
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto min-h-[400px]">
                    {filteredProducts.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            size={gridPattern[index % gridPattern.length]}
                        />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-stone-400 font-light">
                            Cargando piezas exclusivas...
                        </div>
                    )}
                </div>

                {/* View All CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-16"
                >
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 text-stone-900 font-medium hover:text-amber-800 transition-colors group"
                    >
                        <span>Ver toda la colección</span>
                        <svg
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
