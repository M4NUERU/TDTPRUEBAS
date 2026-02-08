'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { formatCOP } from '@/lib/utils'

interface ProductCardProps {
    product: Product
    index: number
    size?: 'normal' | 'large' | 'tall'
}

export default function ProductCard({ product, index, size = 'normal' }: ProductCardProps) {
    const sizeClasses = {
        normal: 'col-span-1 row-span-1',
        large: 'col-span-2 row-span-1 md:col-span-2',
        tall: 'col-span-1 row-span-2',
    }

    const heightClasses = {
        normal: 'h-[320px] md:h-[380px]',
        large: 'h-[320px] md:h-[380px]',
        tall: 'h-[480px] md:h-[580px]',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1]
            }}
            className={`${sizeClasses[size]}`}
        >
            <Link href={`/producto/${product.slug}`}>
                <article
                    className={`product-card group relative overflow-hidden rounded-3xl bg-white ${heightClasses[size]} cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-stone-200 transition-luxury`}
                >
                    {/* Background Surface */}
                    <div className="absolute inset-0 bg-[#fbfaf9]" />

                    {/* Product Preview */}
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* Stylized furniture silhouette */}
                            <svg
                                viewBox="0 0 200 120"
                                className="w-full h-auto max-h-[70%] text-stone-200 group-hover:text-amber-800/10 transition-colors duration-700"
                                fill="currentColor"
                            >
                                {product.category === 'sofacama' && (
                                    <>
                                        <rect x="15" y="55" width="170" height="35" rx="8" />
                                        <rect x="15" y="30" width="170" height="30" rx="8" opacity="0.8" />
                                        <rect x="10" y="45" width="20" height="45" rx="6" />
                                        <rect x="170" y="45" width="20" height="45" rx="6" />
                                    </>
                                )}
                                {product.category === 'puff' && (
                                    <rect x="50" y="25" width="100" height="85" rx="16" />
                                )}
                                {product.category === 'poltrona' && (
                                    <>
                                        <rect x="50" y="20" width="100" height="70" rx="20" />
                                        <rect x="40" y="50" width="120" height="40" rx="10" />
                                    </>
                                )}
                            </svg>
                        </motion.div>
                    </div>

                    {/* 3D Badge - Minimalist */}
                    {product.has3DView && (
                        <div className="absolute top-6 left-6 z-20">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/5 backdrop-blur-md rounded-full border border-stone-900/10">
                                <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                                <span className="text-[10px] font-bold text-stone-900 tracking-widest uppercase">3D Experience</span>
                            </div>
                        </div>
                    )}

                    {/* Content Overlay - Modern Minimalist */}
                    <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                        <div className="flex flex-col gap-1 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-luxury opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                {product.category}
                            </span>
                            <h3 className="text-2xl font-display font-medium text-stone-900">
                                {product.name}
                            </h3>
                            <div className="flex items-center justify-between mt-2 overflow-hidden">
                                <span className="text-sm font-medium text-stone-500">
                                    {formatCOP(product.basePrice)}
                                </span>
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 text-stone-900 text-xs font-bold uppercase tracking-widest"
                                >
                                    Explorar
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Luxury Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-stone-900 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700 pointer-events-none" />
                </article>
            </Link>
        </motion.div>
    )
}
