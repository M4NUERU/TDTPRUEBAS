'use client'

import Link from 'next/link'
import Header from './Header'
import Footer from './Footer'

interface ComingSoonProps {
    title: string
}

export default function ComingSoon({ title }: ComingSoonProps) {
    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="pt-40 pb-20 px-4 text-center">
                <span className="text-amber-800 text-[10px] font-bold uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full">
                    Próximamente
                </span>
                <h1 className="font-display text-4xl sm:text-6xl font-semibold text-stone-900 mt-8 mb-6">
                    {title}
                </h1>
                <p className="text-stone-500 max-w-lg mx-auto leading-relaxed">
                    Nuestros artesanos están preparando el material para esta sección.
                    Muy pronto conocerás los detalles de nuestra tradición artesanal.
                </p>
                <div className="mt-12">
                    <Link href="/" className="px-8 py-4 bg-stone-900 text-stone-50 font-medium rounded-full hover:bg-stone-800 transition-luxury shadow-xl shadow-stone-900/10 uppercase tracking-widest text-[10px]">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    )
}
