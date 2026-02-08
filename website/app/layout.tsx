import type { Metadata } from 'next'
import './globals.css'
import BrandSwitcher from '@/components/ui/BrandSwitcher'
import Header from '@/components/ui/Header'
import CartDrawer from '@/components/ui/CartDrawer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const metadata: Metadata = {
    title: 'TODOTEJIDOS SAS | Muebles Artesanales Colombia',
    description: 'Descubre la elegancia artesanal colombiana. Sofacamas, poltronas y puffs de lujo con telas premium. Experiencia 3D inmersiva y envío a toda Colombia.',
    keywords: ['muebles', 'sofacama', 'poltrona', 'puff', 'tejidos', 'colombia', 'artesanal', 'lujo'],
    authors: [{ name: 'TODOTEJIDOS SAS' }],
    creator: 'TODOTEJIDOS SAS',
    publisher: 'TODOTEJIDOS SAS',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'es_CO',
        url: 'https://todotejidos.com',
        siteName: 'TODOTEJIDOS SAS',
        title: 'TODOTEJIDOS SAS | Muebles Artesanales Colombia',
        description: 'Descubre la elegancia artesanal colombiana. Sofacamas, poltronas y puffs de lujo con telas premium.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'TODOTEJIDOS - Muebles Artesanales',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TODOTEJIDOS SAS | Muebles Artesanales Colombia',
        description: 'Descubre la elegancia artesanal colombiana.',
        images: ['/og-image.jpg'],
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
    },
    themeColor: '#0F172A',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className="scroll-smooth">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className="bg-stone-50 text-stone-900 antialiased selection:bg-brand-gold/30 selection:text-brand-navy">
                <BrandSwitcher />
                <Header />
                <CartDrawer />
                <WhatsAppButton />
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}
