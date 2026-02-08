// Product Types
export interface ProductVariant {
    sku: string
    color: string
    colorHex: string
    price?: number // Override basePrice if specific
    images?: string[] // Per-color gallery
    modelUrl?: string // Per-color 3D model
}

export interface Product {
    id: string
    name: string
    slug: string
    description: string
    basePrice: number
    modelUrl?: string
    usdzUrl?: string
    thumbnailUrl: string
    images: string[]
    has3DView: boolean
    category: 'sofacama' | 'puff' | 'poltrona' | 'sala' | 'sofa' | 'basecama' | 'sillon'
    brand: 'TODOTEJIDOS' | 'EMADERA'
    dimensions: {
        width: number
        height: number
        depth: number
    }
    features: string[]
    variants?: ProductVariant[]
}

// Fabric Types
export interface Fabric {
    id: string
    name: string
    slug: string
    additionalPrice: number
    textureUrl?: string
    colorHex: string
    description: string
    category: 'premium' | 'standard' | 'luxury'
}

// Configuration Types
export interface ProductConfiguration {
    productId: string
    fabricId: string
    quantity: number
}

// Cart Types
export interface CartItem extends ProductConfiguration {
    product: Product
    fabric: Fabric
    totalPrice: number
}

// Price Calculation
export interface PriceBreakdown {
    basePrice: number
    fabricAdditional: number
    subtotal: number
    addiInstallment: number
}

// WhatsApp Message
export interface WhatsAppMessage {
    product: Product
    fabric: Fabric
    totalPrice: number
    phoneNumber: string
}

// Wompi Types
export interface WompiTransaction {
    amount: number
    currency: 'COP'
    reference: string
    customerEmail: string
    customerFullName: string
    redirectUrl: string
}

// AR Viewer Props
export interface ARViewerProps {
    modelUrl: string
    usdzUrl?: string
    alt: string
    poster?: string
}
