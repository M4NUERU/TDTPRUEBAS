import { Product, Fabric } from './types'

// Helper color map for common names
const colorMap: Record<string, string> = {
    'AZUL': '#1e3a8a',
    'GRIS': '#4b5563',
    'CHOCOLATE': '#4b3621',
    'NEGRO': '#111827',
    'GRIS PLATA': '#cbd5e1',
    'MARFIL': '#fdfcf0',
    'MIEL': '#d97706',
    'VERDE': '#15803d',
    'TURQUESA': '#06b6d4',
    'MOSTAZA': '#eab308',
    'ROSA': '#ec4899',
    'BEIGE': '#f5f5dc',
    'ROJO': '#dc2626',
    'VINOTINTO': '#7f1d1d',
    'ACQUA': '#2dd4bf',
    'PETROLEO': '#0d9488',
    'GUAYABA': '#e11d48'
};

export const products: Product[] = [
    // --- SALAS ---
    {
        id: 'sala-barcelona',
        name: 'Sala Barcelona',
        slug: 'sala-barcelona',
        category: 'sala',
        brand: 'TODOTEJIDOS',
        basePrice: 1699900,
        description: 'Juego de sala premium de 5 puestos. Equilibrio perfecto entre estilo contemporáneo y confort excepcional.',
        thumbnailUrl: '/images/products/sala-barcelona-thumb.jpg',
        images: ['/images/products/sala-barcelona-1.jpg'],
        has3DView: false,
        dimensions: { width: 220, height: 85, depth: 90 },
        features: ['5 puestos espaciosos', 'Tapizado premium', 'Estructura Robusta'],
        variants: [
            { sku: '731608', color: 'Azul', colorHex: colorMap['AZUL'] },
            { sku: '701322', color: 'Gris', colorHex: colorMap['GRIS'] }
        ]
    },
    {
        id: 'sala-madrid',
        name: 'Sala en L Madrid',
        slug: 'sala-madrid',
        category: 'sala',
        brand: 'TODOTEJIDOS',
        basePrice: 2509900,
        description: 'Sofisticada sala en L orientada a la versatilidad de 7 puestos. Una pieza maestra para tu hogar.',
        thumbnailUrl: '/images/products/sala-madrid-thumb.jpg',
        images: ['/images/products/sala-madrid-1.jpg'],
        has3DView: false,
        dimensions: { width: 280, height: 85, depth: 160 },
        features: ['7 puestos cómodos', 'Diseño en L modular', 'Tela de alta resistencia'],
        variants: [
            { sku: '3009735', color: 'Chocolate', colorHex: colorMap['CHOCOLATE'] },
            { sku: '734611', color: 'Negro', colorHex: colorMap['NEGRO'], price: 2579900 },
            { sku: '701323', color: 'Gris', colorHex: colorMap['GRIS'], price: 2579900 },
            { sku: '3009734', color: 'Gris Plata', colorHex: colorMap['GRIS PLATA'] },
            { sku: '701324', color: 'Marfil', colorHex: colorMap['MARFIL'], price: 2579900 },
            { sku: '3009736', color: 'Miel', colorHex: colorMap['MIEL'] },
            { sku: '3009737', color: 'Verde', colorHex: colorMap['VERDE'] }
        ]
    },
    {
        id: 'sala-burgos',
        name: 'Sala Modular Burgos',
        slug: 'sala-burgos',
        category: 'sala',
        brand: 'TODOTEJIDOS',
        basePrice: 2579900,
        description: 'Modernidad y confort se unen en la Sala Burgos de 5 puestos.',
        thumbnailUrl: '/images/products/sala-burgos-thumb.jpg',
        images: ['/images/products/sala-burgos-1.jpg'],
        has3DView: false,
        dimensions: { width: 240, height: 85, depth: 90 },
        features: ['5 puestos modulares', 'Diseño contemporáneo'],
        variants: [
            { sku: '734612', color: 'Azul', colorHex: colorMap['AZUL'] }
        ]
    },

    // --- SOFAS ---
    {
        id: 'sofa-segovia',
        name: 'Sofá Segovia',
        slug: 'sofa-segovia',
        category: 'sofa',
        brand: 'TODOTEJIDOS',
        basePrice: 790510,
        description: 'Sofá compacto de 2 puestos ideal para estudios o apartamentos modernos.',
        thumbnailUrl: '/images/products/sofa-segovia-thumb.jpg',
        images: ['/images/products/sofa-segovia-1.jpg'],
        has3DView: false,
        dimensions: { width: 150, height: 85, depth: 80 },
        features: ['2 puestos confortables', 'Estilo minimalista'],
        variants: [
            { sku: '701332', color: 'Gris', colorHex: colorMap['GRIS'] },
            { sku: '701331', color: 'Negro', colorHex: colorMap['NEGRO'] }
        ]
    },
    {
        id: 'sofa-sevilla',
        name: 'Sofá Sevilla',
        slug: 'sofa-sevilla',
        category: 'sofa',
        brand: 'TODOTEJIDOS',
        basePrice: 1069900,
        description: 'Elegante sofá de 2 puestos con acabados de alta costura.',
        thumbnailUrl: '/images/products/sofa-sevilla-thumb.jpg',
        images: ['/images/products/sofa-sevilla-1.jpg'],
        has3DView: true,
        modelUrl: '/models/sevilla_hero.glb',
        dimensions: { width: 160, height: 85, depth: 85 },
        features: ['Acabados premium', 'Espuma de alta densidad'],
        variants: [
            { sku: '3037467', color: 'Azul', colorHex: colorMap['AZUL'] },
            { sku: '3037449', color: 'Chocolate', colorHex: colorMap['CHOCOLATE'] },
            { sku: '705360', color: 'Gris', colorHex: colorMap['GRIS'] },
            { sku: '709347', color: 'Marfil', colorHex: colorMap['MARFIL'] },
            { sku: '3037468', color: 'Miel', colorHex: colorMap['MIEL'] }
        ]
    },

    // --- SOFACAMAS ---
    {
        id: 'sofacama-valencia',
        name: 'Sofacama Valencia',
        slug: 'sofacama-valencia',
        category: 'sofacama',
        brand: 'TODOTEJIDOS',
        basePrice: 1129900,
        description: 'Nuestro modelo más vendido. Versatilidad, diseño y comodidad en una sola pieza.',
        thumbnailUrl: '/images/products/sofacama-valencia-thumb.jpg',
        images: ['/images/products/sofacama-valencia-1.jpg'],
        has3DView: false,
        dimensions: { width: 190, height: 85, depth: 95 },
        features: ['Sistema click-clack', 'Opción con Puff disponible', 'Varios acabados'],
        variants: [
            { sku: '695318', color: 'Chocolate', colorHex: colorMap['CHOCOLATE'] },
            { sku: '696211', color: 'Azul + Puff', colorHex: colorMap['AZUL'], price: 1159900 },
            { sku: '698740', color: 'Gris', colorHex: colorMap['GRIS'] },
            { sku: '699046', color: 'Gris + Puff', colorHex: colorMap['GRIS'], price: 1159900 },
            { sku: '698742', color: 'Plata', colorHex: colorMap['GRIS PLATA'] },
            { sku: '695329', color: 'Mostaza', colorHex: colorMap['MOSTAZA'] },
            { sku: '695307', color: 'Rojo', colorHex: colorMap['ROJO'] },
            { sku: '731609', color: 'Negro', colorHex: colorMap['NEGRO'], price: 1069900 }
        ]
    },
    {
        id: 'sofacama-cordoba',
        name: 'Sofacama Córdoba',
        slug: 'sofacama-cordoba',
        category: 'sofacama',
        brand: 'TODOTEJIDOS',
        basePrice: 1079900,
        description: 'Diseño lineal y moderno con excelente soporte ergonómico.',
        thumbnailUrl: '/images/products/sofacama-cordoba-thumb.jpg',
        images: ['/images/products/sofacama-cordoba-1.jpg'],
        has3DView: false,
        dimensions: { width: 180, height: 85, depth: 90 },
        features: ['Diseño contemporáneo', 'Fácil apertura'],
        variants: [
            { sku: '700608', color: 'Gris', colorHex: colorMap['GRIS'] },
            { sku: '700609', color: 'Turquesa', colorHex: colorMap['TURQUESA'], price: 1739900 }
        ]
    },

    // --- BASECAMAS ---
    {
        id: 'basecama-toledo',
        name: 'Basecama Toledo',
        slug: 'basecama-toledo',
        category: 'basecama',
        brand: 'TODOTEJIDOS',
        basePrice: 399900,
        description: 'Base estructural de madera tapizada en tela de lujo.',
        thumbnailUrl: '/images/products/basecama-toledo-thumb.jpg',
        images: ['/images/products/basecama-toledo-1.jpg'],
        has3DView: false,
        dimensions: { width: 140, height: 30, depth: 190 },
        features: ['Estructura de madera seca', 'Tapizado antideslizante'],
        variants: [
            { sku: '698600', color: 'Gris (140x190)', colorHex: colorMap['GRIS'] },
            { sku: '3037461', color: 'Negro', colorHex: colorMap['NEGRO'], price: 409900 },
            { sku: '698598', color: 'Gris (120x190)', colorHex: colorMap['GRIS'], price: 329900 }
        ]
    },
    // --- E-MADERA PRODUCTS ---
    {
        id: 'mesa-centro-nordica',
        name: 'Mesa de Centro Nórdica',
        slug: 'mesa-centro-nordica',
        category: 'sillon',
        brand: 'EMADERA',
        basePrice: 850000,
        description: 'Mesa de centro tallada en roble macizo con acabados naturales.',
        thumbnailUrl: '/images/products/mesa-nordica-thumb.jpg',
        images: ['/images/products/mesa-nordica-1.jpg'],
        has3DView: false,
        dimensions: { width: 100, height: 45, depth: 60 },
        features: ['Roble macizo', 'Acabado Mate', 'Diseño Nórdico'],
        variants: [
            { sku: 'EM-001', color: 'Roble Natural', colorHex: '#d4a373' }
        ]
    },
    {
        id: 'comedor-rustico',
        name: 'Comedor Rústico 6 Puestos',
        slug: 'comedor-rustico',
        category: 'sala',
        brand: 'EMADERA',
        basePrice: 3200000,
        description: 'Mesa de comedor rústica fabricada en madera de cedro con sillas tapizadas.',
        thumbnailUrl: '/images/products/comedor-rustico-thumb.jpg',
        images: ['/images/products/comedor-rustico-1.jpg'],
        has3DView: false,
        dimensions: { width: 180, height: 75, depth: 100 },
        features: ['Cedro curado', 'Sillas incluidas', 'Estilo campestre'],
        variants: [
            { sku: 'EM-002', color: 'Nogal', colorHex: '#5d3a1a' }
        ]
    }
]

export const fabrics: Fabric[] = [
    {
        id: 'lino-natural',
        name: 'Lino',
        slug: 'lino',
        additionalPrice: 0,
        colorHex: '#d4c5b0',
        description: 'Fibra natural transpirable, perfecta para climas cálidos. Textura artesanal con elegancia atemporal.',
        category: 'standard',
    },
    {
        id: 'terciopelo-luxe',
        name: 'Terciopelo',
        slug: 'terciopelo',
        additionalPrice: 150000,
        colorHex: '#2d4a3e',
        description: 'El epítome del lujo. Terciopelo italiano de fibras ultrafinas con brillo sedoso y tacto incomparable.',
        category: 'luxury',
    }
]

// Helper functions (same as before)
export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id)
}

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug)
}

export function getFabricById(id: string): Fabric | undefined {
    return fabrics.find((f) => f.id === id)
}

export function getProductsByCategory(category: Product['category']): Product[] {
    return products.filter((p) => p.category === category)
}
