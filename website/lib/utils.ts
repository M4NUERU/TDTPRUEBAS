import { Product, Fabric, PriceBreakdown, WhatsAppMessage } from './types'

/**
 * Format price in Colombian Pesos
 */
export function formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format price in Colombian Pesos (short version for display)
 */
export function formatCOPShort(amount: number): string {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`
    }
    return formatCOP(amount)
}

/**
 * Calculate total price with fabric additional
 */
export function calculateTotalPrice(product: Product, fabric: Fabric): number {
    return product.basePrice + fabric.additionalPrice
}

/**
 * Calculate Addi installment (3 cuotas sin interés)
 */
export function calculateAddiInstallment(totalPrice: number, installments: number = 3): number {
    return Math.ceil(totalPrice / installments)
}

/**
 * Get complete price breakdown
 */
export function getPriceBreakdown(product: Product, fabric: Fabric): PriceBreakdown {
    const subtotal = calculateTotalPrice(product, fabric)
    return {
        basePrice: product.basePrice,
        fabricAdditional: fabric.additionalPrice,
        subtotal,
        addiInstallment: calculateAddiInstallment(subtotal),
    }
}

/**
 * Generate WhatsApp message URL
 */
export function generateWhatsAppUrl(config: WhatsAppMessage): string {
    const message = encodeURIComponent(
        `¡Hola! 👋 Estoy interesado en:\n\n` +
        `🪑 *${config.product.name}*\n` +
        `🧵 Tela: ${config.fabric.name}\n` +
        `💰 Precio Total: ${formatCOP(config.totalPrice)}\n\n` +
        `¿Podrían darme más información sobre disponibilidad y tiempos de entrega?`
    )
    return `https://wa.me/${config.phoneNumber}?text=${message}`
}

/**
 * WhatsApp Business number for TODOTEJIDOS
 */
export const WHATSAPP_NUMBER = '573001234567' // Replace with actual number

/**
 * Generate Wompi payment reference
 */
export function generatePaymentReference(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `TT-${timestamp}-${random}`.toUpperCase()
}

/**
 * Utility to combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
}

/**
 * Map a value from one range to another
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}
