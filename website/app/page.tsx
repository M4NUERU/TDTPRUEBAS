'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/ui/Header'
import BentoGrid from '@/components/ui/BentoGrid'
import Footer from '@/components/ui/Footer'

// Dynamic import for 3D component to avoid SSR issues
const Hero3D = dynamic(() => import('@/components/3d/Hero3D'), {
    ssr: false,
    loading: () => (
        <div className="hero-section flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-stone-200 border-t-amber-800 rounded-full animate-spin" />
                <p className="text-stone-500">Cargando experiencia 3D...</p>
            </div>
        </div>
    ),
})

// Features Section Component
function FeaturesSection() {
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Garantía de 5 Años',
            description: 'Respaldamos la calidad artesanal de cada pieza con garantía extendida.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            title: 'Envío a Todo Colombia',
            description: 'Entrega gratis en ciudades principales. Llegamos hasta tu puerta.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            title: 'Paga en Cuotas',
            description: 'Hasta 3 cuotas sin interés con Addi o financiación tradicional.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
            ),
            title: 'Visualiza en 3D y AR',
            description: 'Experimenta cada mueble en tu espacio antes de comprarlo.',
        },
    ]

    return (
        <section className="py-20 bg-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="text-center p-6 bg-stone-50 rounded-2xl hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Testimonials Section
function TestimonialsSection() {
    const testimonials = [
        {
            quote: 'La calidad del sofacama Valencia superó todas mis expectativas. El poder verlo en 3D antes de comprarlo fue decisivo.',
            author: 'María García',
            location: 'Bogotá',
            rating: 5,
        },
        {
            quote: 'Excelente servicio y la tela antirasguño es perfecta para mi hogar con mascotas. ¡Muy recomendado!',
            author: 'Carlos Rodríguez',
            location: 'Medellín',
            rating: 5,
        },
        {
            quote: 'El puff 5 en 1 es increíble. Versátil, elegante y muy cómodo. Pagar en cuotas con Addi fue súper fácil.',
            author: 'Ana Martínez',
            location: 'Cali',
            rating: 5,
        },
    ]

    return (
        <section className="py-20 bg-stone-900 text-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-amber-500 text-sm tracking-widest uppercase font-medium">
                        Testimonios
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-4">
                        Lo que dicen nuestros clientes
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-6 bg-stone-800 rounded-2xl"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-stone-300 leading-relaxed mb-6">
                                &quot;{testimonial.quote}&quot;
                            </p>
                            <div>
                                <p className="font-medium text-stone-50">{testimonial.author}</p>
                                <p className="text-sm text-stone-400">{testimonial.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Newsletter Section
function NewsletterSection() {
    return (
        <section className="py-20 bg-amber-800 text-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                    Únete a nuestra comunidad
                </h2>
                <p className="text-amber-100 mb-8">
                    Recibe ofertas exclusivas, inspiración de diseño y noticias sobre nuevos lanzamientos.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        className="flex-1 px-4 py-3 rounded-full text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-stone-900 text-stone-50 font-medium rounded-full hover:bg-stone-800 transition-colors"
                    >
                        Suscribirse
                    </button>
                </form>
            </div>
        </section>
    )
}

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Hero3D />
            <BentoGrid />
            <FeaturesSection />
            <Footer />
        </main>
    )
}
